import { VMContext, u128, PersistentVector, Context, VM } from 'near-sdk-as';
import * as contract from '../assembly';
import * as models from '../assembly/models';
import { toYocto, MIN_ACCOUNT_BALANCE } from '../../utils';

/**
 * == HELPER FUNCTIONS =========================================================
 */
const attachMinBalance = (): void => {
  VMContext.setAttached_deposit(MIN_ACCOUNT_BALANCE);
};

const setPredecessor = (name: string = 'alice'): void => {
  VMContext.setPredecessor_account_id(name);
};

const setSigner = (name: string = 'alice'): void => {
  VMContext.setSigner_account_id(name);
};

/**
 * == UNIT TESTS ==============================================================
 */
const comments = new PersistentVector<models.Comment>("c");

const title = "hello"
const artist = "alice"
const category = models.Category.A
let meme: models.Meme

describe('meme', () => {

  it('saves the meme', () => {
    attachMinBalance()
    contract.initialize(title, artist, category)
    // log(VM.logs())

    const m = contract.get_meme()
    expect(m.title == title)
    expect(m.artist == artist)
    expect(m.category == category)
    expect(m.donations.length == 0)
    expect(m.votes.length == 0)
  })

  it('saves a comment to the meme', () => {
    attachMinBalance()
    contract.initialize(title, artist, category)

    contract.add_comment("yo")
    expect(contract.get_meme().comments.length == 1)
  })
})

describe('voting', () => {
  beforeEach(() => {
    setSigner()
    setPredecessor()
    attachMinBalance()
    contract.initialize(title, artist, category)
  })

  it('saves a vote and calculates vote_score', () => {
    contract.vote(-1)
    const m = contract.get_meme()
    expect(m.votes.length == 1)
    expect(m.vote_score == -1)
  })

  it('saves group votes and calculates vote_score', () => {
    contract.group_vote(3)
    const m = contract.get_meme()
    expect(m.votes.length == 1)
    expect(m.vote_score == 3)
  })

  it('returns 10 votes', () => {
    const accounts = 'abcdefghijklmnopqrstuvwxyz'
    const accountsList = accounts.split("")

    for (let i = 0; i < accountsList.length; i++) {
      setSigner(accountsList[i])
      setPredecessor(accountsList[i])
      contract.vote(Math.random() > 0.5 ? 1 : - 1)
    }

    const m = contract.get_meme()

    expect(accountsList.length).not.toBe(10)
    expect(m.votes.length).toBe(accountsList.length)
    expect(contract.get_recent_votes().length).toBe(10, "recent votes should be 10")
  })

})
