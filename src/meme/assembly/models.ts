import {
  u128,
  context,
  storage,
  PersistentVector,
  PersistentSet
} from "near-sdk-as";

import { MEME_KEY, PAGE_SIZE, Category, AccountId, Money, Timestamp } from "../../utils";

@nearBindgen
export class Comment {
  created_at: Timestamp = context.blockTimestamp;
  author: AccountId = context.predecessor;

  constructor(
    public text: string
  ) { }
}

@nearBindgen
export class Vote {
  created_at: Timestamp = context.blockTimestamp;

  constructor(
    public value: i8,
    public voter: AccountId
  ) { }
}

@nearBindgen
export class Donation {
  // by default, without a constructor, all fields are public
  // so these instance fields will be set from the context
  // and then available on the public interface
  amount: Money = context.attachedDeposit;
  donor: AccountId = context.predecessor;
  created_at: Timestamp = context.blockTimestamp;
}

@nearBindgen
export class Meme {
  creator: AccountId = context.predecessor;
  created_at: Timestamp = context.blockTimestamp;
  vote_score: i32 = 0;
  total_donations: u128 = u128.Zero;

  constructor(
    public title: string,
    public data: string,
    public category: Category,
  ) { }


  // ----------------------------------------------------------------------------
  // Basic functions
  // ----------------------------------------------------------------------------

  static create(title: string, data: string, category: Category): void {
    // data has to have identifier from valid content provider
    assert(is_valid_meme_data(data), "Data is not valid, must start with valid 9gag.com URL")

    // save the meme to storage
    const meme = new Meme(title, data, category)
    this.set(meme)
  }

  static get(): Meme {
    return storage.getSome<Meme>(MEME_KEY)
  }

  static set(meme: Meme): void {
    storage.set(MEME_KEY, meme)
  }

  // ----------------------------------------------------------------------------
  // Voting
  // ----------------------------------------------------------------------------
  static add_vote(voter: string, value: i8): void {
    // allow each account to vote only once
    assert(!voters.has(voter), "Voter has already voted")
    // fetch meme from storage
    const meme = this.get()
    // calculate the new score for the meme
    meme.vote_score = meme.vote_score + value
    // save it back to storage
    this.set(meme)
    // remember the voter has voted
    voters.add(voter)
    // add the new Vote
    votes.push(new Vote(value, voter))
  }

  static get_votes_count(): u32 {
    return votes.length
  }

  static recent_votes(count: i32 = PAGE_SIZE): Vote[] {
    return votes.get_last(count)
  }

  // ----------------------------------------------------------------------------
  // Comments
  // ----------------------------------------------------------------------------
  static add_comment(text: string): void {
    comments.push(new Comment(text))
  }

  static get_comments_count(): u32 {
    return comments.length
  }

  static recent_comments(count: i32 = PAGE_SIZE): Comment[] {
    return comments.get_last(count)
  }

  // ----------------------------------------------------------------------------
  // Donations
  // ----------------------------------------------------------------------------
  static add_donation(): void {
    // fetch meme from storage
    const meme = this.get()
    // record the donation
    meme.total_donations = u128.add(meme.total_donations, context.attachedDeposit);
    // save it back to storage
    this.set(meme)
    // add the new Donation
    donations.push(new Donation())
  }

  static get_donations_count(): u32 {
    return donations.length
  }

  static recent_donations(count: i32 = PAGE_SIZE): Donation[] {
    return donations.get_last(count)
  }
}

/**
 * Handle validation and extraction of meme data
 */
function is_valid_meme_data(data: string): bool {
  return data.startsWith("https://9gag.com")
}

// DEPRECATED: decided against this
// to simplify rendering especially if we add more valid prefixes
function extract_identifier(data: string): string {
  const gag_id = data.split("/").pop()
  assert(gag_id.length < 20, "9gag.com ID is too long")
  return gag_id
}

/**
 * setup a generic subclass instead of duplicating the get_last method
 */
class Vector<T> extends PersistentVector<T> {
  /**
   * this method isn't normally available on a PersistentVector
   * so we add it here to make our lives easier when returning the
   * last `n` items for comments, votes and donations
   * @param count
   */
  get_last(count: i32): Array<T> {
    const n = min(count, this.length);
    const startIndex = this.length - n;
    const result = new Array<T>();
    for (let i = startIndex; i < this.length; i++) {
      const entry = this[i];
      result.push(entry);
    }
    return result;
  }
}

const comments = new Vector<Comment>("c");
const votes = new Vector<Vote>("v");
const voters = new PersistentSet<AccountId>("vs");
const donations = new Vector<Donation>("d");
