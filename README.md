# The Meme Museum

This repository includes contracts for NEAR Academy

## Usage

### Top-level `yarn` commands

- run `yarn test` to run all tests
  - run `yarn test:unit` to run only unit tests
  - run `yarn test:simulate` to run only simulation tests
- run `yarn build` to quickly verify build status
- run `yarn clean` to clean up build folder

### Other documentation

- **Meme** contract and test documentation
  - see `/src/meme/README` for Meme interface
  - see `/src/meme/__tests__/README` for Meme unit testing details

- **Museum** contract and test documentation
  - see `/src/museum/README` for Museum interface
  - see `/src/museum/__tests__/README` for Museum unit testing details

- simulation tests
  - see `/simulation/README` for simulation testing


## The file system

Please note that boilerplate project configuration files have been ommitted from the following lists for simplicity.

### Contracts and Unit Tests

```txt
src
├── meme                          <-- self-contained Meme contract
│   ├── README.md
│   ├── __tests__                 <-- unit tests
│   │   ├── README.md
│   │   └── index.unit.spec.ts
│   └── assembly                  <-- contract code
│       ├── index.ts
│       └── models.ts
├── museum                        <-- self-contained Museum contract
│   ├── README.md
│   ├── __tests__                 <-- unit tests
│   │   ├── README.md
│   │   └── index.unit.spec.ts
│   └── assembly                  <-- contract code
│       ├── index.ts
│       └── models.ts
└── utils.ts                      <-- shared contract code
```

### Simulation Tests

```txt
simulation                        <-- simulation tests
├── Cargo.toml
├── README.md
└── src
    ├── lib.rs
    ├── meme.rs
    └── museum.rs
```
