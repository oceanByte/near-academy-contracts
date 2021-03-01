# Meme Contract

**NOTE**

If you try to call a method which requires a signature from a valid account, you will see this error:

```txt
"error": "wasm execution failed with error: FunctionCallError(HostError(ProhibitedInView ..."
```

This will happen anytime you try using `near view ...` when you should be using `near call ...`.  So it's important to pay close attention in the following examples as to which is being used, a `view` or a `call` (aka. "change") method.

----

## deployment

```sh
near dev-deploy ./build/release/meme.wasm
```

## initialization

`init(title: string, data: string, category: Category): void`

```sh
# anyone can initialize meme (so this must be done by the museum at deploy-time)
near call dev-1614603380541-7288163 init '{"title": "hello world", "data": "https://9gag.com/gag/ayMDG8Y", "category": 0}' --account_id dev-1614603380541-7288163 --amount 3
```

## view methods

`get_meme(): Meme`

```sh
# anyone can read meme metadata
near view dev-1614603380541-7288163 get_meme
```

```js
{
  creator: 'dev-1614603380541-7288163',
  created_at: '1614603702927464728',
  vote_score: 4,
  total_donations: '0',
  title: 'hello world',
  data: 'https://9gag.com/gag/ayMDG8Y',
  category: 0
}
```


`get_recent_votes(): Array<Vote>`

```sh
# anyone can request a list of recent votes
near view dev-1614603380541-7288163 get_recent_votes
```

```js
[
  {
    created_at: '1614603886399296553',
    value: 1,
    voter: 'dev-1614603380541-7288163'
  },
  {
    created_at: '1614603988616406809',
    value: 1,
    voter: 'sherif.testnet'
  },
  {
    created_at: '1614604214413823755',
    value: 2,
    voter: 'batch-dev-1614603380541-7288163'
  },
  [length]: 3
]
```

`get_vote_score(): i32`

```sh
near view dev-1614603380541-7288163 get_vote_score
```

```js
4
```


`get_donations_total(): u128`

```sh
near view dev-1614603380541-7288163 get_donations_total
```

```js
'5000000000000000000000000'
```

`get_recent_donations(): Array<Donation>`

```sh
near view dev-1614603380541-7288163 get_recent_donations
```

```js
[
  {
    amount: '5000000000000000000000000',
    donor: 'sherif.testnet',
    created_at: '1614604980292030188'
  },
  [length]: 1
]
```


## change methods

`vote(value: i8): void`

```sh
# user votes for meme
near call dev-1614603380541-7288163 vote '{"value": 1}' --account_id sherif.testnet
```

`batch_vote(value: i8, is_batch: bool = true): void`

```sh
# only the meme contract can call this method
near call dev-1614603380541-7288163 batch_vote '{"value": 2}' --account_id dev-1614603380541-7288163
```


`add_comment(text: string): void`

```sh
near call dev-1614603380541-7288163 add_comment '{"text":"i love this meme"}' --account_id sherif.testnet
```

`get_recent_comments(): Array<Comment>`

```sh
near view dev-1614603380541-7288163 get_recent_comments
```

```js
[
  {
    created_at: '1614604543670811624',
    author: 'sherif.testnet',
    text: 'i love this meme'
  },
  [length]: 1
]
```

`donate(): void`

```sh
near call dev-1614603380541-7288163 donate --account_id sherif.testnet --amount 5
```

`release_donations(account: AccountId): void`

```sh
near call dev-1614603380541-7288163 release_donations '{"account":"sherif.testnet"}' --account_id dev-1614603380541-728816
```

This method automatically calls `on_donations_released` which logs *"Donations were released"*
