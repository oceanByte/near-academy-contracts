import { VMContext, u128, PersistentVector, PersistentSet } from "near-sdk-as";
import * as util from "../../utils";
import * as model from "../assembly/models";
import * as contract from "../assembly";

/**
 * == CONFIG VALUES ============================================================
 */
const TITLE = "usain refrain";
const DATA = "https://9gag.com/gag/ayMDG8Y";
const CATEGORY = util.Category.A;
const MUSEUM_ACCOUNT_ID = "museum";
const CREATOR_ACCOUNT_ID = "alice";
const CONTRIBUTOR_ACCOUNT_ID = "bob";
const ONE_NEAR = u128.from('1000000000000000000000000');
const ATTACHED_DEPOSIT = u128.mul(ONE_NEAR, u128.from(10));

/**
 * == HELPER FUNCTIONS =========================================================
 */
const useMuseumAsPredecessor = (): void => {
  VMContext.setPredecessor_account_id(MUSEUM_ACCOUNT_ID);
};

const useContributorAsPredecessor = (): void => {
  VMContext.setPredecessor_account_id(CONTRIBUTOR_ACCOUNT_ID);
};

const attachMinBalance = (): void => {
  VMContext.setAttached_deposit(util.MIN_ACCOUNT_BALANCE);
};

const doInitialize = (): void => {
  attachMinBalance();
  useMuseumAsPredecessor();
  contract.init(TITLE, DATA, CATEGORY);
}

const comments = (): PersistentVector<model.Comment> => {
  return new PersistentVector<model.Comment>("c");
};

const votes = (): PersistentVector<model.Vote> => {
  return new PersistentVector<model.Vote>("v");
};

const voters = (): PersistentSet<util.AccountId> => {
  return new PersistentSet<util.AccountId>("vs");
};

const donations = (): PersistentVector<model.Donation> => {
  return new PersistentVector<model.Donation>("d");
};

/**
 * == UNIT TESTS ==============================================================
 */

describe("meme initialization", () => {
  beforeEach(useMuseumAsPredecessor)

  it("creates a new meme with proper metadata", () => {
    attachMinBalance()

    contract.init(TITLE, DATA, CATEGORY);
    const m = contract.get_meme()

    expect(m.title).toBe(TITLE)
    expect(m.data).toBe(DATA)
    expect(m.category).toBe(CATEGORY)
    expect(m.total_donations).toBe(u128.Zero)
    expect(m.vote_score).toBe(0)
  });

  it("prevents double initialization", () => {
    attachMinBalance()

    contract.init(TITLE, DATA, CATEGORY);

    expect(() => {
      contract.init(TITLE, DATA, CATEGORY);
    }).toThrow("Contract is already initialized")
  });

  it("requires title not to be blank", () => {
    attachMinBalance()

    expect(() => {
      contract.init("", DATA, CATEGORY);
    }).toThrow("Meme title may not be blank")
  });

  it("requires a minimum balance", () => {
    expect(() => {
      contract.init(TITLE, DATA, CATEGORY);
    }).toThrow("Minimum account balance must be attached to initialize this contract (3 NEAR)")
  });

});

describe("meme voting", () => {
  beforeEach(doInitialize)

  it("allows individuals to vote", () => {
    useContributorAsPredecessor()

    expect(votes.length).toBe(0)
    contract.vote(1)
    expect(votes().length).toBe(1)
  });

  it("prevents vote automation for individuals", () => {
    expect(() => {
      contract.vote(1)
    }).toThrow("Users must vote directly")
  })

  it("prevents any user from voting more than once", () => {
    useContributorAsPredecessor()
    contract.vote(1)

    expect(() => {
      contract.vote(1)
    }).toThrow("Voter has already voted")
  });

  describe("meme captures votes", () => {
    beforeEach(() => {
      VMContext.setSigner_account_id(CREATOR_ACCOUNT_ID)
      VMContext.setPredecessor_account_id(CREATOR_ACCOUNT_ID)
      contract.vote(1)

      VMContext.setSigner_account_id(CONTRIBUTOR_ACCOUNT_ID)
      VMContext.setPredecessor_account_id(CONTRIBUTOR_ACCOUNT_ID)
      contract.vote(1)
    })

    it("captures all votes", () => {
      expect(votes().length).toBe(2)
      expect(voters().values().length).toBe(2)
    });

    it("calculates a running vote score", () => {
      expect(contract.get_vote_score()).toBe(2)
    });

    it("returns a list of recent votes", () => {
      expect(contract.get_recent_votes().length).toBe(2)
    })
  })

  it("allows groups to vote", () => {
    VMContext.setSigner_account_id(CREATOR_ACCOUNT_ID)
    VMContext.setPredecessor_account_id(CREATOR_ACCOUNT_ID)

    contract.batch_vote(3)

    expect(votes().length).toBe(1)
    expect(voters().values()[0].startsWith("batch-")).toBeTruthy()
  });
});


describe("meme comments", () => {
  beforeEach(doInitialize)

  beforeEach(() => {
    VMContext.setSigner_account_id(CONTRIBUTOR_ACCOUNT_ID)
    VMContext.setPredecessor_account_id(CONTRIBUTOR_ACCOUNT_ID)
  })

  it("captures comments", () => {
    contract.add_comment("i love this meme!")
    expect(comments().length).toBe(1)
  })

  it("rejects comments that are too long", () => {
    expect(() => {
      // AssemblyScript doesn't support closures as of time of writing
      const TOO_LONG_TEXT = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempore, doloremque. Quod maiores consectetur praesentium, aperiam repellendus facere velit dolorum vel corporis nisi pariatur asperiores animi quibusdam soluta deserunt nam? Repudiandae quidem quos expedita, vero, obcaecati ex, incidunt sequi porro corporis unde omnis ducimus tempora earum excepturi atque ea aliquid aliquam voluptates necessitatibus sit nostrum iure? Velit adipisci hic molestiae iure minima sint illum ex mollitia vitae consequuntur deserunt sit placeat, obcaecati quasi fugit odit aspernatur animi repellendus fugiat at dignissimos nihil!";

      contract.add_comment(TOO_LONG_TEXT)
    }).toThrow("Comment is too long, must be less than 500")
  });

  it("captures multiple comments", () => {
    VMContext.setSigner_account_id(CREATOR_ACCOUNT_ID)
    VMContext.setPredecessor_account_id(CREATOR_ACCOUNT_ID)
    contract.add_comment("i love this")

    VMContext.setSigner_account_id(CONTRIBUTOR_ACCOUNT_ID)
    VMContext.setPredecessor_account_id(CONTRIBUTOR_ACCOUNT_ID)
    contract.add_comment("i don't like it")

    expect(contract.get_recent_comments().length).toBe(2)
  });
})

describe("meme donations", () => {
  beforeEach(doInitialize)

  it("captures donations  ", () => {
    VMContext.setAttached_deposit(ATTACHED_DEPOSIT)
    VMContext.setSigner_account_id(CREATOR_ACCOUNT_ID)
    VMContext.setPredecessor_account_id(CREATOR_ACCOUNT_ID)

    contract.donate()
    expect(contract.get_meme().total_donations).toBe(ATTACHED_DEPOSIT)
  })

  describe("captures donations", () => {

    beforeEach(() => {
      VMContext.setAttached_deposit(ATTACHED_DEPOSIT)

      VMContext.setSigner_account_id(CREATOR_ACCOUNT_ID)
      VMContext.setPredecessor_account_id(CREATOR_ACCOUNT_ID)
      contract.donate()

      VMContext.setSigner_account_id(CONTRIBUTOR_ACCOUNT_ID)
      VMContext.setPredecessor_account_id(CONTRIBUTOR_ACCOUNT_ID)
      contract.donate()
    })

    it("captures all donations", () => {
      expect(donations().length).toBe(2)
    });

    it("calculates a running donations total", () => {
      const twice_attached_deposit = u128.mul(u128.from(2), ATTACHED_DEPOSIT)
      expect(contract.get_donations_total()).toBe(twice_attached_deposit)
    });

    it("returns a list of recent donations", () => {
      expect(contract.get_recent_donations().length).toBe(2)
    })
  })

  // we have to use simulation tests for cross-contract calls
  xit("releases donations", () => { })
})
