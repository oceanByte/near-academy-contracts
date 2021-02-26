import { context, PersistentSet, storage } from "near-sdk-as"
import { MUSEUM_KEY, AccountId, Timestamp, Category } from "../../utils";

@nearBindgen
export class Museum {
  created_at: Timestamp = context.blockTimestamp;

  constructor(
    public name: String,
    public owners: AccountId[],

  ) { }

  // ----------------------------------------------------------------------------
  // Basic functions
  // ----------------------------------------------------------------------------

  static create(name: string, owners: AccountId[]): void {
    // save the meme to storage
    this.set(new Museum(name, owners))
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

  static add_meme(accountId: string): void {
    memes.add(accountId)
  }

  static get_meme_args(title: string, data: string, category: Category): string {
    return "{'title': '" + title + "', 'data': " + data + "', 'category': '" + category.toString() + "'}";
  }

  static has_meme(accountId: string): bool {
    return memes.has(accountId)
  }

  static get_memes_count(): u32 {
    return memes.size
  }

  static get_meme_list(): string[] {
    return memes.values()
  }

  // ----------------------------------------------------------------------------
  // Contributors
  // ----------------------------------------------------------------------------

  static add_contributor(account: string): void {
    contributors.add(account)
  }

  static remove_contributor(account: string): void {
    contributors
  }

}

const memes = new PersistentSet<AccountId>("m")
const contributors = new PersistentSet<AccountId>("c")
