import {
  context,
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

  constructor(
    public text: String,
    public author: AccountId,
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
  created_at: Timestamp = context.blockTimestamp;
  vote_score: i32 = 0;
  comments: PersistentVector<Comment> = new PersistentVector<Comment>("c");
  votes: PersistentVector<Vote> = new PersistentVector<Vote>("v");
  donations: PersistentVector<Donation> = new PersistentVector<Donation>("d");

  constructor(
    public title: String,
    public artist: String,
    public category: Category,
  ) { }

  /**
   * return the last `count` votes for the meme
   * @param count
   */
  last_votes(count: i32): Vote[] {
    const n = min(count, this.votes.length);
    const startIndex = this.votes.length - n;
    const result = new Array<Vote>();
    for (let i = startIndex; i < this.votes.length; i++) {
      const entry = this.votes[i];
      result.push(entry);
    }
    return result;
  }
}
