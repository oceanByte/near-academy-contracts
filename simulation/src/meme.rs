use near_sdk::near_bindgen;

#[near_bindgen]
pub struct Meme {}

#[near_bindgen]
impl Meme {
    pub fn initialize(title: &str, artist: &str, category: u8) {}

    pub fn get_meme() {}

    pub fn add_comment(text: &str) {}

    pub fn vote(value: i8) {}

    pub fn group_vote(value: i8, isGroup: bool) {}

    pub fn get_recent_votes() {}

    pub fn get_vote_score() {}

    pub fn donate() {}
}
