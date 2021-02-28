import { context, PersistentSet, storage } from "near-sdk-as"
import { MUSEUM_KEY, AccountId, Timestamp, Category } from "../../utils";

@nearBindgen
export class Museum {
  created_at: Timestamp = context.blockTimestamp;

  constructor(
    public name: string,

  ) { }

  // ----------------------------------------------------------------------------
  // Basic functions
  // ----------------------------------------------------------------------------

  static create(name: string, new_owners: AccountId[]): void {
    assert(name.length > 0, "Museum name may not be blank")

    // save the meme to storage
    this.set(new Museum(name))

    // capture owners
    for (let i = 0; i < new_owners.length; i++) {
      owners.add(new_owners[i])
    }
  }

  static get(): Museum {
    return storage.getSome<Museum>(MUSEUM_KEY)
  }

  static set(meme: Museum): void {
    storage.set(MUSEUM_KEY, meme)
  }

  // ----------------------------------------------------------------------------
  // Memes
  // ----------------------------------------------------------------------------

  static add_meme(accountId: AccountId): void {
    memes.add(accountId)
  }

  static remove_meme(accountId: AccountId): void {
    memes.delete(accountId)
  }

  static get_meme_args(title: string, data: string, category: Category): string {
    return "{'title': '" + title + "', 'data': " + data + "', 'category': '" + category.toString() + "'}";
  }

  static has_meme(accountId: AccountId): bool {
    return memes.has(accountId)
  }

  static get_meme_list(): string[] {
    return memes.values()
  }

  static get_meme_count(): u32 {
    return memes.size
  }

  // ----------------------------------------------------------------------------
  // Contributors
  // ----------------------------------------------------------------------------

  static add_contributor(account: string): void {
    contributors.add(account)
  }

  static remove_contributor(account: string): void {
    contributors.delete(account)
  }

  // ----------------------------------------------------------------------------
  // Owners
  // ----------------------------------------------------------------------------

  static add_owner(account: string): void {
    owners.add(account)
  }

  static remove_owner(account: AccountId): void {
    owners.delete(account)
  }

  static has_owner(account: AccountId): bool {
    return owners.has(account)
  }

  static get_owner_list(): AccountId[] {
    return owners.values()
  }
}

const memes = new PersistentSet<AccountId>("m")
const contributors = new PersistentSet<AccountId>("c")
const owners = new PersistentSet<AccountId>("o")
