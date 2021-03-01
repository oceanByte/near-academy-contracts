import {
  u128,
  context,
  storage,
  logging,
  ContractPromiseBatch,
} from "near-sdk-as";

import { MEME_KEY, XCC_GAS, MIN_ACCOUNT_BALANCE, MAX_COMMENT_LENGTH, AccountId, Category } from "../../utils";
import { Comment, Vote, Meme, Donation } from "./models";

/**
 * == PUBLIC METHODS ==========================================================
 *
 * The contract's public API.
 */

/**
 * Initialize meme with basic metadata
 *
 * @param title the name of the meme
 * @param data the data containing some unique identifier of the meme used for rendering
 * @param category the category of the meme
 */
export function init(title: string, data: string, category: Category): void {
  // contract may only be initialized once
  assert(!is_initialized(), "Contract is already initialized.");

  // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    "Minimum account balance must be attached to initialize this contract (3 NEAR)"
  );

  // title has to be at least 1 character
  assert(title.length > 0, "Meme title may not be blank");

  // create the meme using incoming metadata
  Meme.create(title, data, category)
}

/**
 * Return the meme
 */
export function get_meme(): Meme {
  assert_contract_is_initialized()
  return Meme.get()
}

// ----------------------------------------------------------------------------
// Voting
// ----------------------------------------------------------------------------

/**
 * Register a single vote, up or down, for the meme
 *
 * @param value the value of the vote, up vote is +1 and down vote is -1
 */
export function vote(value: i8): void {
  assert_contract_is_initialized()
  assert(context.sender == context.predecessor, "Users must vote directly")
  assert(value == 1 || value == -1, "Invalid vote, must be -1 or 1")

  // register the vote
  batch_vote(value, false)
}

/**
 * Register a batched vote where several votes are captured together
 *
 * @param value the value of the batched vote, max possible batch score is +/- 127
 * @param isGroup
 */
export function batch_vote(value: i8, is_batch: bool = true): void {
  // register the vote
  if (is_batch) {
    assert(context.predecessor == context.contractName, "Batch votes may only be made by the Meme account")
  }

  const voter = is_batch ? "batch-" + context.predecessor : context.predecessor
  Meme.add_vote(voter, value)
}

/**
 * Get a list ofrecent votes
 */
export function get_recent_votes(): Array<Vote> {
  assert_contract_is_initialized()
  return Meme.recent_votes()
}

/**
 * Get the current vote score
 */
export function get_vote_score(): i32 {
  assert_contract_is_initialized()
  return Meme.get().vote_score
}

// ----------------------------------------------------------------------------
// Comments
// ----------------------------------------------------------------------------

/**
 * Add a comment
 *
 * @param text the text of the comment, max comment length of MAX_COMMENT_LENGTH
 */
export function add_comment(text: string): void {
  assert_contract_is_initialized()
  assert(context.sender == context.predecessor, "Users must comment directly")
  assert_reasonable_comment_length(text)
  Meme.add_comment(text)
}

/**
 * Get a list o recent comments
 */
export function get_recent_comments(): Array<Comment> {
  assert_contract_is_initialized()
  return Meme.recent_comments()
}

// ----------------------------------------------------------------------------
// Donations
// ----------------------------------------------------------------------------

/**
 * Donate tokens to the contract
 */
export function donate(): void {
  assert_contract_is_initialized()
  assert(context.sender == context.predecessor, "Users must donate directly")
  assert(context.attachedDeposit > u128.Zero, "Donor must attach some money")

  Meme.add_donation()
}

/**
 * Get a list of donations
 */
export function get_donations_total(): u128 {
  assert_contract_is_initialized()
  return Meme.get().total_donations
}

/**
 * Get a list o recent comments
 */
export function get_recent_donations(): Array<Donation> {
  assert_contract_is_initialized()
  return Meme.recent_donations()
}


/**
 * Transfer all donations to a specified account
 *
 * @param account NEAR account to receive donations after release
 */
export function release_donations(account: AccountId): void {
  assert_contract_is_initialized()
  assert_signed_by_creator()

  // transfer funds to provided account and call ourselves back once transfer is complete
  ContractPromiseBatch.create(account)
    .transfer(Meme.get().total_donations)
    .then(context.contractName).function_call("on_donations_released", "{}", u128.Zero, XCC_GAS)
}

/**
 * Callback method invoked once donation release is complete
 */
export function on_donations_released(): void {
  logging.log("Donations were released")
}

/**
 * == PRIVATE FUNCTIONS ========================================================
 *
 * Helper functions that are not part of the contract interface
 */

/**
 * Manage comment properties
 */
function assert_reasonable_comment_length(text: string): void {
  assert(text.length < MAX_COMMENT_LENGTH, "Comment is too long, must be less than " + MAX_COMMENT_LENGTH.toString())
}

/**
 * Indicate whether contract caller is the creator
 */
function is_creator(): bool {
  return context.predecessor == Meme.get().creator
}

function assert_signed_by_creator(): void {
  assert(is_creator(), "This method can only be called by the meme creator")
}

/**
 * Track whether or not the meme has been initialized.
 */
function is_initialized(): bool {
  return storage.hasKey(MEME_KEY);
}

function assert_contract_is_initialized(): void {
  assert(is_initialized(), "Contract must be initialized first.");
}
