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
const data = "ayMDG8Y" // https://9gag.com/gag/ayMDG8Y
const category = models.Category.A
let meme: models.Meme

describe('meme', () => {

  it('saves the meme', () => {
    attachMinBalance()
    setSigner()
    contract.init(title, data, category)
    // log(VM.logs())

    const m = contract.get_meme()
    expect(m.title).toBe(title)
    expect(m.data).toBe(data)
    expect(m.creator).toBe('alice')
    expect(m.category).toBe(category)
    expect(models.Meme.get_donations_count()).toBe(0)
    expect(models.Meme.get_votes_count()).toBe(0)
  })

  it('saves a comment to the meme', () => {
    attachMinBalance()
    contract.init(title, data, category)

    contract.add_comment("yo")
    expect(models.Meme.get_comments_count()).toBe(1)
  })
})

describe('voting', () => {
  beforeEach(() => {
    setSigner()
    setPredecessor()
    attachMinBalance()
    contract.init(title, data, category)
  })

  it('saves a vote and calculates vote_score', () => {
    contract.vote(-1)
    const m = contract.get_meme()
    expect(models.Meme.get_votes_count()).toBe(1)
    expect(m.vote_score).toBe(-1)
  })

  it('saves group votes and calculates vote_score', () => {
    contract.group_vote(3)
    const m = contract.get_meme()
    expect(models.Meme.get_votes_count()).toBe(1)
    expect(m.vote_score).toBe(3)
  })

  it('returns 10 votes', () => {
    const accounts = 'abcdefghijklmnopqrstuvwxyz'
    const accountsList = accounts.split("")

    for (let i = 0; i < accountsList.length; i++) {
      setSigner(accountsList[i])
      setPredecessor(accountsList[i])
      contract.vote(Math.random() > 0.5 ? 1 : - 1)
    }

    expect(accountsList.length).not.toBe(10)
    expect(models.Meme.get_votes_count()).toBe(accountsList.length)
    expect(contract.get_recent_votes().length).toBe(10, "recent votes should be 10")
  })

})

describe('donating', () => {
  beforeEach(() => {
    setSigner()
    setPredecessor()
    attachMinBalance()
    contract.init(title, data, category)
  })

  it('captures donation', () => {
    const ATTACHED_DEPOSIT = u128.from(10)
    VMContext.setAttached_deposit(ATTACHED_DEPOSIT)

    contract.donate()

    const m = contract.get_meme()
    expect(models.Meme.recent_donations(10).length).toBe(1)
    expect(m.total_donations).toBe(ATTACHED_DEPOSIT)
  })
})
