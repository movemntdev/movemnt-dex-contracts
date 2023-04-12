#[test_only]
module movement_dex::get_lp_account_address {

    use aptos_std::debug;

    use aptos_framework::account;

    #[test]
    public fun get_lp_account_address() {
        debug::print(&account::create_resource_address(&@movement_dex, b"emergency_account_seed"));
    }
}
