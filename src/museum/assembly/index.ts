import { ContractPromiseBatch, context, base58, u128, env, storage, logging } from "near-sdk-as"
import { MIN_ACCOUNT_BALANCE, AccountId, Category, MUSEUM_KEY, XCC_GAS } from "../../utils";
import { Museum } from "./models";

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
  name: AccountId,
  title: string,
  data: string,
  category: Category,
  public_key: string = "", //base58 publickey string
): void {
  assert_contract_is_initialized()
  assert(env.isValidAccountID(name), "Meme name must be valid NEAR account name")

  let accountId = name + "." + context.contractName
  assert(!Museum.has_meme(accountId), "Meme name already exists")

  Museum.add_meme(accountId)

  let promise = ContractPromiseBatch.create(accountId)
    .create_account()
    .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))
    .transfer(context.attachedDeposit)

  if (public_key) {
    promise = promise.add_full_access_key(base58.decode(public_key))
  }

  // @ts-ignore
  promise.function_call(
    "init",
    Museum.get_meme_args(title, data, category),
    u128.Zero,
    env.prepaid_gas()
  )

  logging.log("museum was created")
}

/**
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

  const args = new MemeRemovedArgs(meme)

  ContractPromiseBatch.create(meme)
    .delete_account(context.contractName)
    .then(context.contractName)
    .function_call(
      "on_meme_removed",
      args,
      u128.Zero,
      XCC_GAS
    )
}

export function on_meme_removed(meme: AccountId): void {
  // TODO: confirm that promise was successful
  logging.log("[ " + meme + " ] was removed")
  Museum.remove_meme(meme)
}

class MemeRemovedArgs {
  constructor(
    public meme: string
  ) { }
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
  return !!storage.hasKey(MUSEUM_KEY);
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

function assert_signed_by_owner(): void {
  assert(is_owner(), "This method can only be called by a museum owner")
}
