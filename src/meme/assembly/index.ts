// @nearfile out
import {
  u128,
  context,
  storage,
  logging,
} from 'near-sdk-as';

import { MIN_ACCOUNT_BALANCE } from '../../utils';
import { Category, Comment, Vote, Donation, Meme } from './models';

const MEME_KEY = "initialized"

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
export function initialize(title: string, artist: string, category: Category): void {
  assert(!is_initialized(), 'Contract is already initialized.');
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    'MIN_ACCOUNT_BALANCE must be attached to initialize (3 NEAR)'
  );

  assert(title.length > 0, "Meme title may not be blank");

  logging.log("initializing meme with title: " + title);

  const new_meme = new Meme(title, artist, category)
  storage.set("meme", new_meme);
}

export function get_meme(): Meme {
  return storage.getSome<Meme>("meme")
}

export function add_comment(text: string): void {
  const meme = storage.getSome<Meme>("meme")
  meme.comments.push(new Comment(text, context.sender))
}

export function vote(value: i8): void {
  assert(context.sender == context.predecessor, "users must vote directly")
  assert(value == 1 || value == -1, "invalid vote, must be -1 or 1")

  // register the vote
  group_vote(value, false)
}

export function group_vote(value: i8, isGroup: bool = true): void {
  // fetch meme from storage
  const meme = storage.getSome<Meme>("meme")
  // register the vote
  const voter = isGroup ? "group-" + context.predecessor : context.predecessor
  meme.votes.push(new Vote(value, voter))
  // calculate the new score for the meme
  meme.vote_score = meme.vote_score + value
}

export function get_recent_votes(): Array<Vote> {
  // fetch votes from meme from storage
  const meme = storage.getSome<Meme>("meme")
  // extract 10 votes
  return meme.last_votes(10)
}

export function get_vote_score(): i32 {
  return storage.getSome<Meme>("meme").vote_score
}

export function donate(): void {
  assert(context.sender == context.predecessor, "users must donate directly")
  assert(context.attachedDeposit > u128.Zero, "donor must attach some money")

  // fetch meme from storage
  const meme = storage.getSome<Meme>("meme")
  // capture the donation
  meme.donations.push(new Donation())
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
