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

    fn init() -> (UserAccount, ContractAccount<MemeContract>) {
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

    #[test]
    fn test_initialize() {
        let (master_account, meme) = init();

        // let factory_account_id = "meme".to_string();
        // let factory2 =
        // InMemorySigner::from_seed(&factory_account_id, KeyType::ED25519, &factory_account_id);

        // let factory = meme.user_account.switch_signer(factory2.into());
        // a factory account will generate this meme.  we can pretend this happens here

        let title = "holiday special";
        let artist = "alice";
        let res = call!(
            master_account,
            meme.init(&title, &artist, 0),
            deposit = to_yocto("3")
        );
        // println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
        println!("{:#?}\n", res);
        // res.assert_success()
    }

    // #[test]
    // fn test_factory() {
    //     let (master_account, proposal) = init();

    //     call!(
    //         master_account,
    //         proposal.initialize(),
    //         deposit = to_yocto("3")
    //     );

    //     let res = call!(master_account, proposal.get_factory());
    //     // println!("{:#?}\n", res.unwrap_json_value());
    //     assert!(res.unwrap_json_value().eq("root"));
    // }

    // #[test]
    // fn test_add_supporter() {
    //     let (master_account, proposal) = init();

    //     // master_account.account().
    //     // let account = runtime.view_account(&"root").unwrap();
    //     // println!("{:#?}\n", account);

    //     call!(
    //         master_account,
    //         proposal.initialize(),
    //         deposit = to_yocto("3")
    //     );

    //     call!(
    //         master_account,
    //         proposal.configure(
    //             "some proposal",
    //             "really tho",
    //             to_yocto("10").into(),
    //             to_yocto("3").into()
    //         )
    //     );

    //     call!(
    //         master_account,
    //         proposal.add_supporter(),
    //         deposit = to_yocto("5")
    //     );

    //     let added = call!(
    //         master_account,
    //         proposal.add_supporter(),
    //         deposit = to_yocto("6")
    //     );

    //     println!("{:#?}\n", added);

    //     let total = call!(master_account, proposal.get_funding_total());
    //     println!("{:#?}\n", total);

    //     // println!("{:#?}\n", res.unwrap_json_value());
    //     // assert!(res.unwrap_json_value().eq("root"));
    // }
}
