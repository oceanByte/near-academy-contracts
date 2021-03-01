# Simulation Tests

## Usage

`yarn test:simulate`

## File Structure

```txt
simulation
├── Cargo.toml      <-- Rust project config
├── README.md       <-- * you are here
└── src
    ├── lib.rs      <-- this is the business end of simulation
    ├── meme.rs     <-- type wrapper for Meme contract
    └── museum.rs   <-- type wrapper for Museum contract
```

## Orientation

The simulation environment requires that we


## Output

```txt
running 1 test
---------------------------------------
---- INIT MUSEUM ----------------------
---------------------------------------

ExecutionResult {
    outcome: ExecutionOutcome {
        logs: [
            "museum was created",
        ],
        receipt_ids: [],
        burnt_gas: 4354462070277,
        tokens_burnt: 0,
        status: SuccessValue(``),
    },
}

---------------------------------------
---- ADD CONTRIBUTOR ------------------
---------------------------------------

ExecutionResult {
    outcome: ExecutionOutcome {
        logs: [
            "contributor was added",
        ],
        receipt_ids: [],
        burnt_gas: 4884161460212,
        tokens_burnt: 0,
        status: SuccessValue(``),
    },
}

---------------------------------------
---- CREATE MEME ----------------------
---------------------------------------

[
    Some(
        ExecutionResult {
            outcome: ExecutionOutcome {
                logs: [],
                receipt_ids: [
                    `AmMRhhhYir4wNuUxhf8uCoKgnpv5nHQGvBqAeEWFL344`,
                ],
                burnt_gas: 2428142357466,
                tokens_burnt: 0,
                status: SuccessReceiptId(AmMRhhhYir4wNuUxhf8uCoKgnpv5nHQGvBqAeEWFL344),
            },
        },
    ),
    Some(
        ExecutionResult {
            outcome: ExecutionOutcome {
                logs: [
                    "attempting to create meme",
                ],
                receipt_ids: [
                    `B2BBAoJYj3EFE3Co6PRmfkXopTD654gUj8H6ywSsQD9e`,
                    `4NWBWN9dWuwiwbkwnub9Rv134Ubu2eJmbkdk1bJzeFtr`,
                ],
                burnt_gas: 19963342520004,
                tokens_burnt: 0,
                status: SuccessValue(``),
            },
        },
    ),
    Some(
        ExecutionResult {
            outcome: ExecutionOutcome {
                logs: [],
                receipt_ids: [],
                burnt_gas: 4033749130056,
                tokens_burnt: 0,
                status: SuccessValue(``),
            },
        },
    ),
    Some(
        ExecutionResult {
            outcome: ExecutionOutcome {
                logs: [
                    "Meme [ usain.museum ] successfully created",
                ],
                receipt_ids: [],
                burnt_gas: 4644097556149,
                tokens_burnt: 0,
                status: SuccessValue(``),
            },
        },
    ),
]

---------------------------------------
---- VERIFY MEME ----------------------
---------------------------------------

Object({
    "creator": String(
        "museum",
    ),
    "created_at": String(
        "17000000000",
    ),
    "vote_score": Number(
        0,
    ),
    "total_donations": String(
        "0",
    ),
    "title": String(
        "usain refrain",
    ),
    "data": String(
        "https://9gag.com/gag/ayMDG8Y",
    ),
    "category": Number(
        0,
    ),
})

test test::test_add_meme ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests simulation-near-academy-contracts

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

✨  Done in 20.99s.

```
