# Museum Contract

**NOTE**

If you try to call a method which requires a signature from a valid account, you will see this error:

```txt
"error": "wasm execution failed with error: FunctionCallError(HostError(ProhibitedInView ..."
```

This will happen anytime you try using `near view ...` when you should be using `near call ...`.  So it's important to pay close attention in the following examples as to which is being used, a `view` or a `call` (aka. "change") method.

----

## deployment

```sh
near dev-deploy ./build/release/museum.wasm
```

## initialization

`init(name: string, owners: AccountId[]): void`

```sh
near call dev-1614636496022-6736851 init '{"name":"The Meme Museum", "owners": ["sherif.testnet"]}' --account_id dev-1614636496022-6736851 --amount 3
```

## view methods

`get_museum(): Museum`

```sh
near view dev-1614636496022-6736851 get_museum
```

```js
{ created_at: '1614636541756865886', name: 'The Meme Museum' }
```

`get_owner_list(): AccountId[]`

```sh
near view dev-1614636496022-6736851 get_owner_list
```

```js
[ 'sherif.testnet', [length]: 1 ]
```

`get_meme_list(): AccountId[]`

```sh
near view dev-1614636496022-6736851 get_meme_list
```

```js
[ 'usain', [length]: 1 ]
```

`get_meme_count(): u32`

```sh
near view dev-1614636496022-6736851 get_meme_count
```

```js
1
```

## change methods

### contributor methods

`add_myself_as_contributor(): void`

```sh
near call dev-1614636496022-6736851 add_myself_as_contributor --account_id sherif.testnet
```


`remove_myself_as_contributor(): void`

```sh
near call dev-1614636496022-6736851 remove_myself_as_contributor --account_id sherif.testnet
```

`add_meme(name: AccountId, title: string, data: string, category: Category): void`

```sh
near call dev-1614636496022-6736851 add_meme '{"name":"usain", "title": "usain refrain","data":"https://9gag.com/gag/ayMDG8Y", "category": 0 }' --account_id sherif.testnet --amount 3 --gas "300000000000000"
```


`on_meme_created(meme: AccountId): void`

This method is called automatically by `add_meme()` as a confirmation of meme account creation.


### owner methods


`add_contributor(account: AccountId): void`

```sh
near call dev-1614636496022-6736851 add_contributor '{"account":"sherif.testnet"}' --account_id sherif.testnet
```


`remove_contributor(account: AccountId): void`

```sh
near call dev-1614636496022-6736851 remove_contributor '{"account":"sherif.testnet"}' --account_id sherif.testnet
```


`add_owner(account: AccountId): void`

```sh
near call dev-1614636496022-6736851 add_owner '{"account":"abcabc.testnet"}' --account_id sherif.testnet
```


`remove_owner(account: AccountId): void`

```sh
near call dev-1614636496022-6736851 remove_owner '{"account":"abcabc.testnet"}' --account_id sherif.testnet
```


`remove_meme(meme: AccountId): void`

```sh
near call dev-1614636496022-6736851 remove_meme '{"meme":"usain"}' --account_id sherif.testnet
```


`on_meme_removed(meme: AccountId): void`

This method is called automatically by `remove_meme()` as a confirmation of meme account deletion.
