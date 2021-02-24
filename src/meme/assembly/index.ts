// @nearfile out
import {
  u128,
  context,
  storage,
  logging,
} from 'near-sdk-as';

import { AccountId, MIN_ACCOUNT_BALANCE } from '../../utils';
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
export function init(title: string, artist: string, category: Category): void {
  assert(!is_initialized(), 'Contract is already initialized.');
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    'MIN_ACCOUNT_BALANCE must be attached to initialize (3 NEAR)'
  );

  assert(title.length > 0, "Meme title may not be blank");

  Meme.create(title, artist, category)
}

export function get_meme(): Meme {
  return Meme.get()
}

export function add_comment(text: string): void {
  Meme.add_comment(new Comment(text))
}

export function get_recent_comments(): Array<Comment> {
  return Meme.recent_comments(10)
}

export function vote(value: i8): void {
  assert(context.sender == context.predecessor, "users must vote directly")
  assert(value == 1 || value == -1, "invalid vote, must be -1 or 1")

  // register the vote
  group_vote(value, false)
}

export function group_vote(value: i8, isGroup: bool = true): void {
  // register the vote
  const voter = isGroup ? "group-" + context.predecessor : context.predecessor
  // Meme.add_vote(new Vote(value, voter))
  Meme.add_vote(voter, value)
}

export function get_recent_votes(): Array<Vote> {
  return Meme.recent_votes(10)
}

export function get_vote_score(): i32 {
  return Meme.get().vote_score
}

export function donate(): void {
  assert(context.sender == context.predecessor, "users must donate directly")
  assert(context.attachedDeposit > u128.Zero, "donor must attach some money")

  Meme.add_donation()
}

export function get_donations(): u128 {
  return Meme.get().total_donations
}

//todo
export function release_donation(account: AccountId): bool {
  assert(false, "only the meme creator can do this")
  return true
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
