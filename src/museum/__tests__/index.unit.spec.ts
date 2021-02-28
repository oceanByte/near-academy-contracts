import { VMContext, PersistentSet } from "near-sdk-as";
import * as util from "../../utils";
import * as contract from "../assembly";

/**
 * == CONFIG VALUES ============================================================
 */
const NAME = "usain";
const MUSEUM_ACCOUNT_ID = "museum";
const OWNER_ACCOUNT_ID = "alice";
const CONTRIBUTOR_ACCOUNT_ID = "bob";

/**
 * == HELPER FUNCTIONS =========================================================
 */
const useMuseumAsPredecessor = (): void => {
  VMContext.setPredecessor_account_id(MUSEUM_ACCOUNT_ID);
};

const useAdminAsPredecessor = (): void => {
  VMContext.setPredecessor_account_id(OWNER_ACCOUNT_ID);
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
  contract.init(NAME, [OWNER_ACCOUNT_ID])
}

const memes = (): PersistentSet<util.AccountId> => {
  return new PersistentSet<util.AccountId>("m")
};

const contributors = (): PersistentSet<util.AccountId> => {
  return new PersistentSet<util.AccountId>("c");
};

const owners = (): PersistentSet<util.AccountId> => {
  return new PersistentSet<util.AccountId>("o");
};

/**
 * == UNIT TESTS ==============================================================
 */

describe("museum initialization", () => {
  beforeEach(useMuseumAsPredecessor)

  it("creates a new museum with proper metadata", () => {
    attachMinBalance()

    contract.init(NAME, [OWNER_ACCOUNT_ID])
    const m = contract.get_museum()

    expect(m.name).toBe(NAME)
    expect(owners().size).toBe(1)
  });

  it("prevents double initialization", () => {
    attachMinBalance()

    contract.init(NAME, [OWNER_ACCOUNT_ID])

    expect(() => {
      contract.init(NAME, [OWNER_ACCOUNT_ID])
    }).toThrow("Contract is already initialized")
  });

  it("requires title not to be blank", () => {
    attachMinBalance()

    expect(() => {
      contract.init("", [OWNER_ACCOUNT_ID])
    }).toThrow("Museum name may not be blank")
  });

  it("requires a minimum balance", () => {
    expect(() => {
      contract.init(NAME, [OWNER_ACCOUNT_ID])
    }).toThrow("Minimum account balance must be attached to initialize this contract (3 NEAR)")
  });

});

describe("Museum self-service methods", () => {
  beforeEach(doInitialize)

  it("returns a list of owners", () => {
    expect(contract.get_owner_list().length).toBe(1)
  })

  it("returns a list of memes", () => {
    memes().add(NAME) // can't actually create a meme using unit tests due to cross-contract call
    expect(contract.get_meme_list()[0]).toBe(NAME)
  })

  it("returns a count of memes", () => {
    memes().add(NAME) // can't actually create a meme using unit tests due to cross-contract call
    expect(contract.get_meme_count()).toBe(1)
  })

  it("allows users to add / remove themselves as contributors", () => {
    useContributorAsPredecessor()

    contract.add_myself_as_contributor()
    expect(contributors().values().length).toBe(1)
    expect(contributors().values().includes(CONTRIBUTOR_ACCOUNT_ID)).toBeTruthy()

    contract.remove_myself_as_contributor()
    expect(contributors().values().length).toBe(0)
  })

  // we have to use simulation tests for cross-contract calls
  xit("allows whitelisted contributors to create a meme", () => { })
})

describe("Museum owner methods", () => {
  beforeEach(doInitialize)
  beforeEach(useAdminAsPredecessor)

  it("allows owners to whitelist a contributor", () => {
    contract.add_contributor(CONTRIBUTOR_ACCOUNT_ID)
    expect(contributors().values().length).toBe(1)
  })

  it("allows owners to remove a contributor", () => {
    contract.add_contributor(CONTRIBUTOR_ACCOUNT_ID)
    expect(contributors().values().length).toBe(1)

    contract.remove_contributor(CONTRIBUTOR_ACCOUNT_ID)
    expect(contributors().values().length).toBe(0)
  })

  it("allows owners to add a new owner", () => {
    contract.add_owner(CONTRIBUTOR_ACCOUNT_ID)
    expect(owners().values().length).toBe(2) // original owner was already there
  })

  it("allows owners to remove an owner", () => {
    contract.add_owner(CONTRIBUTOR_ACCOUNT_ID)
    expect(owners().values().length).toBe(2) // original owner was already there

    contract.remove_owner(CONTRIBUTOR_ACCOUNT_ID)
    expect(owners().values().length).toBe(1)
  })

  // we have to use simulation tests for cross-contract calls
  xit("allows owners to remove a meme", () => { })
})
