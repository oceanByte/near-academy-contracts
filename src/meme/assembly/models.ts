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
//@ts-ignore
export class Comment {
  constructor(
    public text: String,
    public author: AccountId,
    public createdAt: Timestamp = context.blockTimestamp,
  ) { }
}

@nearBindgen
//@ts-ignore
export class Vote {
  constructor(
    public value: i8,
    public voter: AccountId,
    public createdAt: Timestamp = context.blockTimestamp,
  ) { }
}

@nearBindgen
//@ts-ignore
export class Donation {
  constructor(
    public amount: Money,
    public donor: AccountId,
    public createdAt: Timestamp = context.blockTimestamp,
  ) { }
}

@nearBindgen
//@ts-ignore
export class Meme {
  constructor(
    public title: String,
    public artist: String,
    public category: Category,
    //@ts-ignore
    public createdAt: Timestamp = context.blockTimestamp,
    public vote_score: i32 = 0,
    public comments: PersistentVector<Comment> = new PersistentVector<Comment>("c"),
    public votes: PersistentVector<Vote> = new PersistentVector<Vote>("v"),
    public donations: PersistentVector<Donation> = new PersistentVector<Donation>("d")
  ) { }
}
