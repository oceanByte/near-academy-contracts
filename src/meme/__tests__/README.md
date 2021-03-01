# Unit Tests for `Meme` Contract

## Usage

```sh
yarn test:unit -f meme
```

## Output

*Note: the tests marked with `Todo` must be verified using simulation tests because they involve cross-contract calls (which can not be verified using unit tests).*


```txt
[Describe]: meme initialization

 [Success]: ✔ creates a new meme with proper metadata
 [Success]: ✔ prevents double initialization
 [Success]: ✔ requires title not to be blank
 [Success]: ✔ requires a minimum balance

[Describe]: meme voting

 [Success]: ✔ allows individuals to vote
 [Success]: ✔ prevents vote automation for individuals
 [Success]: ✔ prevents any user from voting more than once

[Describe]: meme captures votes

 [Success]: ✔ captures all votes
 [Success]: ✔ calculates a running vote score
 [Success]: ✔ returns a list of recent votes

 [Success]: ✔ allows groups to vote

[Describe]: meme comments

 [Success]: ✔ captures comments
 [Success]: ✔ rejects comments that are too long
 [Success]: ✔ captures multiple comments

[Describe]: meme donations

 [Success]: ✔ captures donations
[Describe]: captures donations

 [Success]: ✔ captures all donations
 [Success]: ✔ calculates a running donations total
 [Success]: ✔ returns a list of recent donations

    [Todo]: releases donations

    [File]: src/meme/__tests__/index.unit.spec.ts
  [Groups]: 7 pass, 7 total
  [Result]: ✔ PASS
[Snapshot]: 0 total, 0 added, 0 removed, 0 different
 [Summary]: 18 pass,  0 fail, 18 total
    [Time]: 46.469ms
```
