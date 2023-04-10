/// The module used to create a resource account to initialize LP coins under
module movement_dex::lp_account {

    use std::signer;

    use aptos_framework::account::{Self, SignerCapability};

    /// when a protected function is called from an unauthorized account
    const ERR_NOT_ENOUGH_PERMISSIONS: u64 = 1701;

    /// temporary storage for resource account signer capability.
    struct CapabilityStorage has key { signer_cap: SignerCapability }

    /// creates new resource account, puts signer capability into storage and deploys LP coin type.
    /// can be executed only from Movement DEX account.
    public entry fun initialize_lp_account(
        movement_dex: &signer,
        lp_coin_metadata_serialized: vector<u8>,
        lp_coin_code: vector<u8>
    ) {
        assert!(signer::address_of(movement_dex) == @movement_dex, ERR_NOT_ENOUGH_PERMISSIONS);

        let (lp_acc, signer_cap) =
            account::create_resource_account(movement_dex, b"movement_dex_account_seed");
        aptos_framework::code::publish_package_txn(
            &lp_acc,
            lp_coin_metadata_serialized,
            vector[lp_coin_code]
        );
        move_to(movement_dex, CapabilityStorage { signer_cap });
    }

    /// destroys temporary storage for resource account signer capability and returns signer capability
    /// called in the initialization of the Movement DEX
    public fun retrieve_signer_cap(movement_dex: &signer): SignerCapability acquires CapabilityStorage {
        assert!(signer::address_of(movement_dex) == @movement_dex, ERR_NOT_ENOUGH_PERMISSIONS);
        let CapabilityStorage { signer_cap } =
            move_from<CapabilityStorage>(signer::address_of(movement_dex));
        signer_cap
    }
}
