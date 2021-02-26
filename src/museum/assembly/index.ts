import { ContractPromiseBatch, context, base58, u128, env, storage } from 'near-sdk-as'
import { MIN_ACCOUNT_BALANCE, AccountId, Category, MUSEUM_KEY } from '../../utils';
import { Museum } from './models';

// import meme contract bytecode as StaticArray
const CODE = includeBytes('../../../build/release/meme.wasm')

export function init(name: string, owners: AccountId[]): void {
  // contract may only be initialized once
  assert(!is_initialized(), 'Contract is already initialized.');

  // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    'MIN_ACCOUNT_BALANCE must be attached to initialize (3 NEAR)'
  );

  // Must have least 1 owner account
  assert(owners.length > 0, "Must specify at least 1 owner");

  // create the museum using incoming metadata
  Museum.create(name, owners)

  // record that the contract has been initialized
  set_initialized()
}

export function get_meme_list(): Array<AccountId> {
  assert_contract_is_initialized()
  return Museum.get_meme_list()
}

export function get_meme_count(): u32 {
  assert_contract_is_initialized()
  return Museum.get_memes_count()
}

export function remove_contributor(account: AccountId): void {
  assert_contract_is_initialized()
  assert(context.predecessor == account, "you can only remove yourself")
  assert(false, "must be museum admin to remove anyone but yourself")

  Museum.remove_contributor(account)
}


export function add_contributor(account: AccountId): void {
  assert_contract_is_initialized()
  assert(context.predecessor == account, "you can only add yourself")
  assert(false, "must be museum admin to add anyone but yourself")

  Museum.add_contributor(account)
}


export function add_meme(
  name: AccountId,
  title: string,
  data: string,
  category: Category,
  public_key: string = '', //base58 publickey string
): void {
  assert_contract_is_initialized()
  let accountId = name + '.' + context.contractName
  assert(!Museum.has_meme(accountId), 'Meme name already exists')

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
}


/**
 * Governance methods reserved for 101Labs and NEAR admins
 */
export function add_admin(account: AccountId): void {
  assert_contract_is_initialized()
  assert(false, "must be an admin of the museum")
}

export function remove_admin(account: AccountId): void {
  assert_contract_is_initialized()
  assert(false, "must be an admin of the museum")
}

export function removeMeme(memeAccount: AccountId): void {
  assert_contract_is_initialized()
  assert(false, "must be an admin of the museum")
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

function set_initialized(): void {
  storage.set(MUSEUM_KEY, true);
}

function assert_contract_is_initialized(): void {
  assert(is_initialized(), "Contract must be initialized first.");
}
