import { VMContext, u128, PersistentVector, Context, VM } from 'near-sdk-as';
import * as contract from '../assembly';
import { toYocto, MIN_ACCOUNT_BALANCE } from '../../utils';

/**
 * == CONFIG VALUES ============================================================
 */
const TITLE = 'common grounds';
const DESCRIPTION = 'your neighborhood coffee spot';
const PROPOSAL_ACCOUNT_ID = 'neighbors.proposal';
const FACTORY_ACCOUNT_ID = 'neighbors.factory';
const CONTRIBUTOR_ACCOUNT_ID = 'dawn';

/**
 * == HELPER FUNCTIONS =========================================================
 */
const attachMinBalance = (): void => {
  VMContext.setAttached_deposit(MIN_ACCOUNT_BALANCE);
};

const comments = new PersistentVector<contract.Comment>("c");

describe('meme', () => {

  it('saves the meme', () => {
    attachMinBalance()
    contract.initialize(new contract.Meme("hello", "alice", contract.Category.A))
    // log(VM.logs())

    const meme = contract.get_meme()
    expect(meme.title == "hello")
  })

  it('saves a comment to the meme', () => {
    attachMinBalance()
    contract.initialize(new contract.Meme("hello", "alice", contract.Category.A))

    contract.add_comment("yo")
    expect(contract.get_meme().comments.length == 1)
  })
})
