#![allow(dead_code, unused_variables, unused_imports, non_snake_case)]
mod museum;
pub use museum::*;

mod meme;
pub use meme::*;

#[cfg(test)]
mod test {
    use near_sdk::{json_types::Base58PublicKey, serde_json::json}; //, U128};
    use near_sdk_sim::near_crypto::{InMemorySigner, KeyType};
    // use std::convert::TryInto;

    use super::*;
    use near_sdk_sim::{call, deploy, init_simulator, to_yocto, ContractAccount, UserAccount};

    // Load in contract bytes
    near_sdk_sim::lazy_static! {
      static ref MUSEUM_WASM_BYTES: &'static [u8] = include_bytes!("../../build/release/museum.wasm").as_ref();
      static ref MEME_WASM_BYTES: &'static [u8] = include_bytes!("../../build/release/meme.wasm").as_ref();
    }

    // ------------------------------------------------------------------------
    // setup meme contract
    // ------------------------------------------------------------------------
    fn initMeme() -> (UserAccount, ContractAccount<MemeContract>) {
        let master_account = init_simulator(None);
        // uses default values for deposit and gas
        let meme_contract = deploy!(
            // Contract Proxy
            contract: MemeContract,
            // Contract account id
            contract_id: "meme",
            // Bytes of contract
            bytes: &MEME_WASM_BYTES,
            // User deploying the contract,
            signer_account: master_account
        );

        // a supporter will be interested in funding this account
        let supporter_account_id = "alice".to_string();
        let alice = InMemorySigner::from_seed(
            &supporter_account_id,
            KeyType::ED25519,
            &supporter_account_id,
        );

        (master_account, meme_contract)
    }

    // ------------------------------------------------------------------------
    // setup museum contract
    // ------------------------------------------------------------------------
    fn initMuseum() -> (UserAccount, ContractAccount<MuseumContract>) {
        let master_account = init_simulator(None);
        // uses default values for deposit and gas
        let museum_contract = deploy!(
            // Contract Proxy
            contract: MuseumContract,
            // Contract account id
            contract_id: "museum",
            // Bytes of contract
            bytes: &MUSEUM_WASM_BYTES,
            // User deploying the contract,
            signer_account: master_account
        );

        (master_account, museum_contract)
    }

    // ------------------------------------------------------------------------
    // test initialize meme
    // ------------------------------------------------------------------------
    // #[test]
    // fn test_initialize() {
    //     let (master_account, meme) = initMeme();

    //     let title = "usain refrain";
    //     let data = "https://9gag.com/gag/ayMDG8Y";
    //     let category = 0; // Category.A

    //     let res = call!(
    //         master_account,
    //         meme.init(&title, &data, category),
    //         deposit = to_yocto("3")
    //     );

    //     println!("{:#?}\n", res);
    //     res.assert_success()
    // }

    // ------------------------------------------------------------------------
    // test add meme to museum
    // ------------------------------------------------------------------------
    #[test]
    fn test_add_meme() {
        let (master_account, museum) = initMuseum();

        // an owner will be able to manage the museum
        let owner_account = "alice".to_string();
        let owner = InMemorySigner::from_seed(&owner_account, KeyType::ED25519, &owner_account);

        // a contributor can add their own memes
        let contributor_account = "bob".to_string();
        let contributor =
            InMemorySigner::from_seed(&contributor_account, KeyType::ED25519, &contributor_account);

        let name = "meme museum";

        // ----------------------------
        // initialize museum
        // ----------------------------

        let res = call!(
            master_account,
            museum.init(&name, vec![&owner_account]),
            deposit = to_yocto("3")
        );

        println!("{:#?}\n", res);
        res.assert_success(); // museum has been initialized

        // ----------------------------
        // add contributor to museum
        // ----------------------------
        // let owner_as_signer = museum.user_account.switch_signer(owner.into());

        let res = call!(
            owner_as_signer,
            museum.add_contributor(&contributor.account_id)
        );

        println!("{:#?}\n", res);
        // res.assert_success(); // contributor has been added

        // ----------------------------
        // switch signer to contributor
        // ----------------------------
        let name = "usain";
        let title = "usain refrain";
        let data = "https://9gag.com/gag/ayMDG8Y";
        let category = 0; // Category.A
        let public_key = &contributor.public_key.to_string(); //base58 public key

        let contributor_as_signer = museum.user_account.switch_signer(contributor.into());

        let res = call!(
            contributor_as_signer,
            museum.add_meme(&name, &title, &data, category, public_key),
            deposit = to_yocto("3")
        );

        println!("{:#?}\n", res);
        // res.assert_success(); // meme has been added
        // println!("{:#?}\n{:#?}\n", res, res.promise_results(),);
    }
}
