import { ContractPromiseBatch, PersistentSet, context, base58, u128, env } from 'near-sdk-as'
import { AccountId } from '../../utils';
import { Meme } from './models';

const CODE = includeBytes('../../../build/release/meme.wasm')

/// This gas spent on the call & account creation, the rest goes to the `new` call.
const ONE_TERAGAS: u64 = 1000000000000
// const CREATE_CALL_GAS: u64 =  40 * ONE_TERAGAS

const memes = new PersistentSet<AccountId>("m")


export function init(): void {
  // register museum admins (101Labs and NEAR accounts)
}

export function get_meme_list(): Array<AccountId> {
  return memes.values()
}

export function get_meme_count(): u32 {
  return memes.values().length
}

export function remove_contributor(account: AccountId): void {
  assert(context.predecessor == account, "you can only remove yourself")
  assert(false, "must be museum admin to remove anyone but yourself")
}


export function add_contributor(account: AccountId): void {
  assert(context.predecessor == account, "you can only add yourself")
  assert(false, "must be museum admin to add anyone but yourself")
}


export function add_meme(
  name: AccountId,
  args: Meme,
  public_key: string = '', //base58 publickey string
): void {
  let accountId = name + '.' + context.contractName
  assert(!memes.has(accountId), 'Meme name already exists')

  memes.add(accountId)

  let promise = ContractPromiseBatch.create(accountId)
    .create_account()
    .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))
    .transfer(context.attachedDeposit)

  if (public_key) {
    promise = promise.add_full_access_key(base58.decode(public_key))
  }

  promise.function_call(
    'initialize',
    args,
    u128.Zero,
    env.prepaid_gas()// - CREATE_CALL_GAS
  )
}


/**
 * Governance methods reserved for 101Labs and NEAR admins
 */
export function add_admin(account: AccountId): void {
  assert(false, "must be an admin of the museum")
}

export function remove_admin(account: AccountId): void {
  assert(false, "must be an admin of the museum")
}

export function removeMeme(memeAccount: AccountId): void {
  assert(false, "must be an admin of the museum")
}
