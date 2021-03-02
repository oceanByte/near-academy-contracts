# Museum Contract

**NOTE**

If you try to call a method which requires a signature from a valid account, you will see this error:

```txt
"error": "wasm execution failed with error: FunctionCallError(HostError(ProhibitedInView ..."
```

This will happen anytime you try using `near view ...` when you should be using `near call ...`.  So it's important to pay close attention in the following examples as to which is being used, a `view` or a `call` (aka. "change") method.

----

## environment

```sh
# contract source code
export WASM_FILE=./build/release/museum.wasm

# system accounts
export CONTRACT_ACCOUNT=# NEAR account where the contract will live
export MASTER_ACCOUNT=$CONTRACT_ACCOUNT # can be any NEAR account that controls CONTRACT_ACCOUNT

# user accounts
export OWNER_ACCOUNT=# NEAR account that will control the museum
export CONTRIBUTOR_ACCOUNT=# NEAR account that will contribute memes

# configuration metadata
export MUSEUM_NAME="The Meme Museum" # a name for the museum itself, just metadata
export ATTACHED_TOKENS=3 # minimum tokens to attach to the museum initialization method (for storage)
export ATTACHED_GAS="300000000000000" # maximum allowable attached gas is 300Tgas (300 "teragas", 300 x 10^12)
```

## deployment

**Approach #1**: using `near dev-deploy` for developer convenience

This contract can be deployed to a temporary development account that's automatically generated:

```sh
near dev-deploy $WASM_FILE
export CONTRACT_ACCOUNT=# the account that appears as a result of running this command
```

The result of executing the above command will be a temporary `dev-###-###` account and related `FullAccess` keys with the contract deployed (to this same account).

**Approach #2**: using `near deploy` for more control

Alternatively, the contract can be deployed to a specific account for which a `FullAccess` key is available.  This account must be created and funded first.

```sh
near create-account $CONTRACT_ACCOUNT --masterAccount $MASTER_ACCOUNT
near deploy $WASM_FILE
```

This manual deployment method is the only way to deploy a contract to a specific account.  It's important to consider initializing the contract in the same step.  This is clarified below in the "initialization" section.


## initialization

`init(name: string, owners: AccountId[]): void`

**Approach #1**: initialize after `dev-deploy`

After `near dev-deploy` we can initialize the contract

```sh
# initialization method arguments
# '{"name":"The Meme Museum", "owners": ["<owner-account-id>"]}'
export INIT_METHOD_ARGS="'{\"name\":\"$MUSEUM_NAME\", \"owners\": [\"$OWNER_ACCOUNT\"]}'"

# initialize contract
near call $CONTRACT_ACCOUNT init $INIT_METHOD_ARGS --account_id $CONTRACT_ACCOUNT --amount $ATTACHED_TOKENS
```

**Approach #2**: deploy and initialize in a single step

Or we can initialize at the same time as deploying.  This is particularly useful for production deployments where an adversarial validator may try to front-run your contract initialization unless you bundle the `FunctionCall` action to `init()` as part of the transaction to `DeployContract`.

```sh
# initialization method arguments
# '{"name":"The Meme Museum", "owners": ["<owner-account-id>"]}'
export INIT_METHOD_ARGS="'{\"name\":\"$MUSEUM_NAME\", \"owners\": [\"$OWNER_ACCOUNT\"]}'"

# deploy AND initialize contract in a single step
near deploy $CONTRACT_ACCOUNT $WASM_FILE --initFunction init --initArgs $INIT_METHOD_ARGS --account_id $CONTRACT_ACCOUNT --initDeposit $ATTACHED_TOKENS
```

## view methods

`get_museum(): Museum`

```sh
near view $CONTRACT_ACCOUNT get_museum
```

```js
{ created_at: '1614636541756865886', name: 'The Meme Museum' }
```

`get_owner_list(): AccountId[]`

```sh
near view $CONTRACT_ACCOUNT get_owner_list
```

```js
[ '<owner-account-id>', [length]: 1 ]
```

`get_meme_list(): AccountId[]`

```sh
near view $CONTRACT_ACCOUNT get_meme_list
```

```js
[ 'usain', [length]: 1 ]
```

`get_meme_count(): u32`

```sh
near view $CONTRACT_ACCOUNT get_meme_count
```

```js
1
```

## change methods

### contributor methods

`add_myself_as_contributor(): void`

```sh
near call $CONTRACT_ACCOUNT add_myself_as_contributor --account_id $CONTRIBUTOR_ACCOUNT
```


`remove_myself_as_contributor(): void`

```sh
near call $CONTRACT_ACCOUNT remove_myself_as_contributor --account_id $CONTRIBUTOR_ACCOUNT
```

`add_meme(meme: AccountId, title: string, data: string, category: Category): void`

```sh
near call $CONTRACT_ACCOUNT add_meme '{"meme":"usain", "title": "usain refrain","data":"https://9gag.com/gag/ayMDG8Y", "category": 0 }' --account_id $CONTRIBUTOR_ACCOUNT --amount $ATTACHED_TOKENS --gas $ATTACHED_GAS
```


`on_meme_created(meme: AccountId): void`

This method is called automatically by `add_meme()` as a confirmation of meme account creation.


### owner methods


`add_contributor(account: AccountId): void`

```sh
# initialization method arguments
# '{"account":"<contributor-account-id>"}'
export METHOD_ARGS="'{\"account\":\"$CONTRIBUTOR_ACCOUNT\"}'"
near call $CONTRACT_ACCOUNT add_contributor $METHOD_ARGS --account_id $OWNER_ACCOUNT
```


`remove_contributor(account: AccountId): void`

```sh
near call $CONTRACT_ACCOUNT remove_contributor '{"account":"<contributor-account-id>"}' --account_id $OWNER_ACCOUNT
```


`add_owner(account: AccountId): void`

```sh
near call $CONTRACT_ACCOUNT add_owner '{"account":"<new-owner-account-id>"}' --account_id $OWNER_ACCOUNT
```


`remove_owner(account: AccountId): void`

```sh
near call $CONTRACT_ACCOUNT remove_owner '{"account":"<some-owner-account-id>"}' --account_id $OWNER_ACCOUNT
```


`remove_meme(meme: AccountId): void`

```sh
near call $CONTRACT_ACCOUNT remove_meme '{"meme":"usain"}' --account_id $OWNER_ACCOUNT
```


`on_meme_removed(meme: AccountId): void`

This method is called automatically by `remove_meme()` as a confirmation of meme account deletion.
