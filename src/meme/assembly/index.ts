// @nearfile out
import {
  u128,
  context,
  storage,
  PersistentVector,
  logging
} from 'near-sdk-as';

import { MIN_ACCOUNT_BALANCE, AccountId, Money, Timestamp } from '../../utils';

const MEME_KEY = "initialized"

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
class Vote {
  constructor(
    public vote: i8,
    public voter: AccountId,
    public createdAt: Timestamp = context.blockTimestamp,
  ) { }
}

@nearBindgen
//@ts-ignore
class Donation {
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

/**
 * == PUBLIC METHODS ===========================================================
 *
 * The contract's public API.
 */

/**
 * @function initialize
 *
 * Sets up and stores new Project.
 */
export function initialize(meme: Meme): void {
  assert(!is_initialized(), 'Contract is already initialized.');
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    'MIN_ACCOUNT_BALANCE must be attached to initialize (3 NEAR)'
  );

  assert(meme.title.length > 0, "Meme title may not be blank");

  logging.log("initializing meme with title: " + meme.title);

  storage.set("meme", meme);
}

export function get_meme(): Meme {
  return storage.getSome<Meme>("meme")
}

export function add_comment(text: String): void {
  const meme = storage.getSome<Meme>("meme")
  meme.comments.push(new Comment(text, context.sender))
}



/**
 * == PRIVATE FUNCTIONS ========================================================
 *
 * Not to be called outside of this proposal.
 */

/**
 * Whether or not the project has been initialized.
 */
function is_initialized(): bool {
  return !!storage.hasKey(MEME_KEY);
}

/**
 * Guard against contract not having been initialized.
 */
function assert_initialized(): void {
  assert(is_initialized(), 'Contract must be initialized first.');
}
