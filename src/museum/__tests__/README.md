# Unit Tests for `Museum` Contract

## Usage

```sh
yarn test:unit -f museum
```

## Output

*Note: the tests marked with `Todo` must be verified using simulation tests because they involve cross-contract calls (which can not be verified using unit tests).*


```txt
[Describe]: museum initialization

 [Success]: ✔ creates a new museum with proper metadata
 [Success]: ✔ prevents double initialization
 [Success]: ✔ requires title not to be blank
 [Success]: ✔ requires a minimum balance

[Describe]: Museum self-service methods

 [Success]: ✔ returns a list of owners
 [Success]: ✔ returns a list of memes
 [Success]: ✔ returns a count of memes
 [Success]: ✔ allows users to add / remove themselves as contributors
    [Todo]: allows whitelisted contributors to create a meme

[Describe]: Museum owner methods

 [Success]: ✔ allows owners to whitelist a contributor
 [Success]: ✔ allows owners to remove a contributor
 [Success]: ✔ allows owners to add a new owner
 [Success]: ✔ allows owners to remove an owner
    [Todo]: allows owners to remove a meme

    [File]: src/museum/__tests__/index.unit.spec.ts
  [Groups]: 4 pass, 4 total
  [Result]: ✔ PASS
[Snapshot]: 0 total, 0 added, 0 removed, 0 different
 [Summary]: 12 pass,  0 fail, 12 total
    [Time]: 29.181ms

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  [Result]: ✔ PASS
   [Files]: 1 total
  [Groups]: 4 count, 4 pass
   [Tests]: 12 pass, 0 fail, 12 total
    [Time]: 8846.571ms
✨  Done in 9.51s.
```
