skeleton for building out Meme Museum


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

```

## view methods

`get_museum(): Museum`

```sh

```

```js

```

`get_owner_list(): AccountId[]`

```sh

```

```js

```

`get_meme_list(): AccountId[]`

```sh

```

```js

```

`get_meme_count(): u32`

```sh

```

```js

```

## change methods

### contributor methods

`add_myself_as_contributor(): void`

```sh

```


`remove_myself_as_contributor(): void`

```sh

```



`add_meme(name: AccountId, title: string, data: string, category: Category): void`

```sh

```


`on_meme_created(meme: AccountId): void`

```sh

```



### owner methods


`add_contributor(account: AccountId): void`

```sh

```


`remove_contributor(account: AccountId): void`

```sh

```


`add_owner(account: AccountId): void`

```sh

```


`remove_owner(account: AccountId): void`

```sh

```


`remove_meme(meme: AccountId): void`

```sh

```


`on_meme_removed(meme: AccountId): void`

```sh

```
