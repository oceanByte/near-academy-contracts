import { u128 } from 'near-sdk-as';

/**
 * == CONSTANTS ================================================================
 *
 * ONE_NEAR = unit of NEAR token in yocto Ⓝ (1e24)
 * XCC_GAS = gas for cross-contract calls, ~5 Tgas (teragas = 1e12) per "hop"
 * MIN_ACCOUNT_BALANCE = 3 NEAR min to keep account alive via storage staking
 *
 * TODO: revist MIN_ACCOUNT_BALANCE after some real data is included b/c this
 *  could end up being much higher
 */

export const ONE_NEAR = u128.from('1000000000000000000000000');
export const XCC_GAS = 20000000000000;
export const MIN_ACCOUNT_BALANCE = u128.mul(ONE_NEAR, u128.from(3));

// common keys for singlton instances and initialization
export const MEME_KEY = "state"
export const MUSEUM_KEY = "state"

// size constraints
export const PAGE_SIZE = 10
export const MAX_COMMENT_LENGTH = 500


/**
 * == TYPES ====================================================================
 */

/**
 * Account IDs in NEAR are just strings.
 */
export type AccountId = string;

/**
 * Money in NEAR is a u128.
 */
export type Money = u128;

/**
 * Timestamp in NEAR is a number.
 */
export type Timestamp = u64;

/**
 * Category for grouping memes
 */
export enum Category {
  A = 0 as i8,
  B = 1 as i8,
  C = 2 as i8,
  D = 4 as i8,
}

/**
 * == FUNCTIONS ================================================================
 */

/**
 * @function asNEAR
 * @param amount {u128} - Yocto Ⓝ token quantity as an unsigned 128-bit integer
 * @returns {string}    - Amount in NEAR, as a string
 *
 * @example
 *
 *    asNEAR(7000000000000000000000000)
 *    // => '7'
 */
export function asNEAR(amount: u128): string {
  return u128.div(amount, ONE_NEAR).toString();
}

/**
 * @function toYocto
 * @param amount {number} - Integer to convert
 * @returns {u128}        - Amount in yocto Ⓝ as an unsigned 128-bit integer
 *
 * @example
 *
 *    toYocto(7)
 *    // => 7000000000000000000000000
 */
export function toYocto(amount: number): u128 {
  return u128.mul(ONE_NEAR, u128.from(amount))
}
