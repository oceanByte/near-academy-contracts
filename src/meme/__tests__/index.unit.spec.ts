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

  beforeAll(() => {
    meme = new models.Meme(title, artist, category)
  })

  it('saves the meme', () => {
    attachMinBalance()
    contract.initialize(meme)
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
    contract.initialize(new models.Meme("hello", "alice", models.Category.A))

    contract.add_comment("yo")
    expect(contract.get_meme().comments.length == 1)
  })
})

describe('voting', () => {
  beforeAll(() => {
    meme = new models.Meme(title, artist, category)
  })

  it('saves a vote and calculates vote_score', () => {
    setSigner()
    setPredecessor()
    attachMinBalance()
    contract.initialize(meme)

    contract.vote(-1)
    const m = contract.get_meme()
    expect(m.votes.length == 1)
    expect(m.vote_score == -1)
  })

  it('saves group votes and calculates vote_score', () => {
    setSigner()
    setPredecessor()
    attachMinBalance()
    contract.initialize(meme)

    contract.group_vote(3)
    const m = contract.get_meme()
    expect(m.votes.length == 1)
    expect(m.vote_score == 3)
  })

  it('returns 10 votes', () => {
    attachMinBalance()
    contract.initialize(meme);

    const accounts = 'abcdefghijk'
    const accountsList = accounts.split()
    for (let i = 0; i < accountsList.length; i++) {
      log(accountsList[i])
      setSigner(accountsList[i])
      setPredecessor(accountsList[i])
      contract.vote(Math.random() > 0.5 ? 1 : - 1)
    }
    const m = contract.get_meme()
    expect(accountsList.length != 10) // should be different
    expect(m.votes.length == accountsList.length)
    expect(contract.get_recent_votes().length == 10)
    log(contract.get_recent_votes())
  })

})
