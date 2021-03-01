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
    use near_sdk_sim::{
        call, deploy, init_simulator, to_yocto, view, ContractAccount, UserAccount,
    };

    // Load in contract bytes
    near_sdk_sim::lazy_static! {
      static ref MUSEUM_WASM_BYTES: &'static [u8] = include_bytes!("../../build/release/museum.wasm").as_ref();
    }

    // ------------------------------------------------------------------------
    // setup meme contract
    // ------------------------------------------------------------------------
    fn initMuseum() -> (UserAccount, ContractAccount<MuseumContract>) {
        let master_account = init_simulator(None);

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
    // test add meme to museum
    // ------------------------------------------------------------------------
    #[test]
    fn test_add_meme() {
        let (master_account, museum) = initMuseum();

        // ----------------------------
        // setup accounts
        // ----------------------------

        // an owner will be able to manage the museum
        let owner = master_account.create_user("alice".to_string(), to_yocto("100"));

        // a contributor will be able to add memes
        let contributor = master_account.create_user("bob".to_string(), to_yocto("100"));

        // ----------------------------
        // initialize museum
        // ----------------------------
        println!("---------------------------------------");
        println!("---- INIT MUSEUM ----------------------");
        println!("---------------------------------------");
        println!("");

        let name = "meme museum";

        let res = call!(
            master_account,
            museum.init(&name, vec![&owner.account_id()]),
            deposit = to_yocto("3")
        );

        println!("{:#?}\n", res);
        res.assert_success(); // museum has been initialized

        // ----------------------------
        // add contributor to museum
        // ----------------------------
        println!("---------------------------------------");
        println!("---- ADD CONTRIBUTOR ------------------");
        println!("---------------------------------------");
        println!("");

        let res = call!(owner, museum.add_contributor(&contributor.account_id()));

        println!("{:#?}\n", res);
        res.assert_success(); // contributor has been added

        // ----------------------------
        // add meme
        // ----------------------------
        println!("---------------------------------------");
        println!("---- CREATE MEME ----------------------");
        println!("---------------------------------------");
        println!("");

        let name = "usain";
        let title = "usain refrain";
        let data = "https://9gag.com/gag/ayMDG8Y";
        let category = 0; // Category.A

        let res = call!(
            contributor,
            museum.add_meme(&name, &title, &data, category),
            deposit = to_yocto("3")
        );

        println!("{:#?}\n", res.promise_results());
        res.assert_success(); // meme has been added

        let meme = near_sdk_sim::ContractAccount::<MemeContract> {
            user_account: museum
                .user_account
                .switch_signer(contributor.signer.clone()),
            contract: MemeContract {
                account_id: "usain.museum".to_string(),
            },
        };

        // ----------------------------
        // call meme for metadata
        // ----------------------------
        println!("---------------------------------------");
        println!("---- VERIFY MEME ----------------------");
        println!("---------------------------------------");
        println!("");

        let res = view!(meme.get_meme());
        println!("{:#?}\n", res.unwrap_json_value());
    }
}
