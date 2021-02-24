import {
  u128,
  context,
  storage,
  PersistentVector,
} from 'near-sdk-as';

import { AccountId, Money, Timestamp } from '../../utils';

export enum Category {
  A = 0 as i8,
  B = 1 as i8,
  C = 2 as i8,
  D = 4 as i8,
}

@nearBindgen
export class Comment {
  created_at: Timestamp = context.blockTimestamp;
  author: AccountId = context.sender;

  constructor(
    public text: String,

  ) { }
}

@nearBindgen
export class Vote {
  created_at: Timestamp = context.blockTimestamp;

  constructor(
    public value: i8,
    public voter: AccountId,
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
  creator: AccountId = context.sender;
  created_at: Timestamp = context.blockTimestamp;
  vote_score: i32 = 0;
  total_donations: u128 = u128.Zero;

  constructor(
    public title: String,
    public data: String, // TODO: data is MEME_ID --> https://9gag.com/gag/MEME_ID
    public category: Category,
  ) { }

  static create(title: string, data: string, category: Category): void {
    this.set(new Meme(title, data, category))
  }

  /**
   * return the last `count` votes for the meme
   * @param count
   */
  static recent_votes(count: i32): Vote[] {
    return votes.get_last(count)
  }

  static recent_donations(count: i32): Donation[] {
    return donations.get_last(count)
  }

  static recent_comments(count: i32): Comment[] {
    return comments.get_last(count)
  }

  static get_votes_count(): u32 {
    return votes.length
  }

  static get_donations_count(): u32 {
    return donations.length
  }

  static get_comments_count(): u32 {
    return comments.length
  }

  static add_vote(voter: string, value: i8): void {
    // fetch meme from storage
    const meme = this.get()
    // calculate the new score for the meme
    meme.vote_score = meme.vote_score + value
    // save it back to storage
    this.set(meme)
    // add the new Vote
    votes.push(new Vote(value, voter))
  }

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

  static add_comment(comment: Comment): void {
    comments.push(comment)
  }

  static get(): Meme {
    return storage.getSome<Meme>("meme")
  }

  static set(meme: Meme): void {
    storage.set("meme", meme)
  }
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
const donations = new Vector<Donation>("d");
