import { ContractPromiseBatch, context, base58, u128, env, storage, logging, ContractPromise } from "near-sdk-as"
import { MIN_ACCOUNT_BALANCE, AccountId, Category, MUSEUM_KEY, XCC_GAS } from "../../utils";
import { Museum, MemeInitArgs, MemeNameAsArg } from "./models";

// import meme contract bytecode as StaticArray
const CODE = includeBytes("../../../build/release/meme.wasm")

export function init(name: string, owners: AccountId[]): void {
  // contract may only be initialized once
  assert(!is_initialized(), "Contract is already initialized.");

  // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    "Minimum account balance must be attached to initialize this contract (3 NEAR)"
  );

  // Must have least 1 owner account
  assert(owners.length > 0, "Must specify at least 1 owner");

  // create the museum using incoming metadata
  Museum.create(name, owners)

  logging.log("museum was created")
}

export function get_museum(): Museum {
  assert_contract_is_initialized()
  return Museum.get()
}

export function get_owner_list(): AccountId[] {
  assert_contract_is_initialized()
  return Museum.get_owner_list()
}

export function get_meme_list(): AccountId[] {
  assert_contract_is_initialized()
  return Museum.get_meme_list()
}

export function get_meme_count(): u32 {
  assert_contract_is_initialized()
  return Museum.get_meme_count()
}

/**
 * Manage your status as a contributor
 */
export function add_myself_as_contributor(): void {
  assert_contract_is_initialized()
  Museum.add_contributor(context.predecessor)
}

export function remove_myself_as_contributor(): void {
  assert_contract_is_initialized()
  Museum.remove_contributor(context.predecessor)
}

/**
 * Add your meme
 */
export function add_meme(
  meme: AccountId,
  title: string,
  data: string,
  category: Category
): void {
  assert_contract_is_initialized()
  assert_signed_by_contributor_or_owner()

  // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    "Minimum account balance must be attached to initialize a meme (3 NEAR)"
  );

  const accountId = full_account_for(meme)

  assert(env.isValidAccountID(accountId), "Meme name must be valid NEAR account name")
  assert(!Museum.has_meme(accountId), "Meme name already exists")

  logging.log("attempting to create meme")

  let promise = ContractPromiseBatch.create(accountId)
    .create_account()
    .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))
    .add_full_access_key(base58.decode(context.senderPublicKey))

  promise.function_call(
    "init",
    new MemeInitArgs(title, data, category),
    context.attachedDeposit,
    XCC_GAS
  )

  promise.then(context.contractName).function_call(
    "on_meme_created",
    new MemeNameAsArg(meme),
    u128.Zero,
    XCC_GAS
  )
}

export function on_meme_created(meme: AccountId): void {
  let results = ContractPromise.getResults();
  let memeCreated = results[0];

  // Verifying the remote contract call succeeded.
  // https://nomicon.io/RuntimeSpec/Components/BindingsSpec/PromisesAPI.html?highlight=promise#returns-3
  switch (memeCreated.status) {
    case 0:
      // promise result is not complete
      logging.log("Meme creation for [ " + full_account_for(meme) + " ] is pending")
      break;
    case 1:
      // promise result is complete and successful
      logging.log("Meme creation for [ " + full_account_for(meme) + " ] succeeded")
      Museum.add_meme(meme)
      break;
    case 2:
      // promise result is complete and failed
      logging.log("Meme creation for [ " + full_account_for(meme) + " ] failed")
      break;

    default:
      logging.log("Unexpected value for promise result [" + memeCreated.status.toString() + "]");
      break;
  }
}

/*
 * Governance methods reserved for 101Labs and NEAR admins
 */
export function add_contributor(account: AccountId): void {
  assert_contract_is_initialized()
  assert_signed_by_owner()

  Museum.add_contributor(account)

  logging.log("contributor was added")
}

export function remove_contributor(account: AccountId): void {
  assert_contract_is_initialized()
  assert_signed_by_owner()

  Museum.remove_contributor(account)
}

export function add_owner(account: AccountId): void {
  assert_contract_is_initialized()
  assert_signed_by_owner()

  Museum.add_owner(account)
}

export function remove_owner(account: AccountId): void {
  assert_contract_is_initialized()
  assert_signed_by_owner()

  Museum.remove_owner(account)
}

export function remove_meme(meme: AccountId): void {
  assert_contract_is_initialized()
  assert_signed_by_owner()

  ContractPromiseBatch.create(full_account_for(meme))
    .delete_account(context.contractName)
    .then(context.contractName)
    .function_call(
      "on_meme_removed",
      new MemeNameAsArg(meme),
      u128.Zero,
      XCC_GAS
    )
}

export function on_meme_removed(meme: AccountId): void {
  // TODO: confirm that promise was successful
  logging.log("[ " + full_account_for(meme) + " ] was removed")
  Museum.remove_meme(meme)
}


/**
 * == PRIVATE FUNCTIONS ========================================================
 *
 * Helper functions that are not part of the contract interface
 */

/**
 * Track whether or not the meme has been initialized.
 */

function is_initialized(): bool {
  return storage.hasKey(MUSEUM_KEY);
}

function assert_contract_is_initialized(): void {
  assert(is_initialized(), "Contract must be initialized first.");
}


/**
 * Indicate whether contract caller is the creator
 */
function is_owner(): bool {
  return Museum.has_owner(context.predecessor)
}

function is_contributor(): bool {
  return Museum.is_contributor(context.predecessor)
}

function assert_signed_by_owner(): void {
  assert(is_owner(), "This method can only be called by a museum owner")
}

function assert_signed_by_contributor_or_owner(): void {
  assert(is_contributor() || is_owner(), "This method can only be called by a museum contributor or owner")
}

function full_account_for(meme: string): string {
  return meme + "." + context.contractName
}

function remaining_gas(): u64 {
  return env.prepaid_gas() - (2 * env.used_gas())
}
