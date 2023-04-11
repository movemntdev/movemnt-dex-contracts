# shellcheck disable=SC2164
cd movement_dex_lp/
aptos move compile --save-metadata
LP_COIN_METADATA=$(cat ./build/MovementDEXLP/package-metadata.bcs | hexdump -ve '/1 "%02x"')
LP_COIN_CODE=$(cat ./build/MovementDEXLP/bytecode_modules/lp_coin.mv | hexdump -ve '/1 "%02x"')

cd ../movement_dex_init/
aptos move publish
aptos move run \
    --function-id default::lp_account::initialize_lp_account \
    --args hex:$LP_COIN_METADATA \
    --args hex:$LP_COIN_CODE

cd ../
aptos move publish
aptos move run \
    --function-id default::liquidity_pool::initialize