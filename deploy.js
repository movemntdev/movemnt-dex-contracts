const aptos = require("aptos");
const fs = require("fs");
const HexString = aptos.HexString;
const shellJs = require("shelljs");
const NODE_URL = "https://submove-fuji.bbd.sh/v1";

// Call the `start` function when the script is executed
start();

async function start() {

  const PK = ""
  const PK_BYTES = new HexString(PK).toUint8Array()

  const client = new aptos.AptosClient(NODE_URL);
  const account = new aptos.AptosAccount(PK_BYTES);

  // Compile the contract
  shellJs.exec("aptos move compile --save-metadata --package-dir movement_dex_lp");
  // Load the contract
  const lpCoinMetadata = fs.readFileSync(
    "movement_dex_lp/build/MovementDEXLP/package-metadata.bcs"
  );
  const lpCoinCode = fs.readFileSync(
    "movement_dex_lp/build/MovementDEXLP/bytecode_modules/lp_coin.mv"
  );

  shellJs.exec("aptos move compile --save-metadata --package-dir movement_dex_init");

  const dexInitMetadata = fs.readFileSync(
    "movement_dex_init/build/MovementDEXInit/package-metadata.bcs"
  );
  const dexInitCode = fs.readFileSync(
    "movement_dex_init/build/MovementDEXInit/bytecode_modules/lp_account.mv"
  );
  // Deploy the contract
  let res = await client.publishPackage(
    account,
    new HexString(dexInitMetadata.toString("hex")).toUint8Array(),
    [
      new aptos.TxnBuilderTypes.Module(
        new HexString(dexInitCode.toString("hex")).toUint8Array()
      ),
    ],
  );
  await client.waitForTransactionWithResult(res)
      .then((res) => console.log(res.vm_status))
      .catch((e) => console.error(e));

  // initialize LP account
  const payload = {
    function: "0x5d74b9dfc5e930db7fd9530675e06a0bb52800cb5bf7c038a6f886aa3c00381d::lp_account::initialize_lp_account",
    type_arguments: [],
    arguments: [
        lpCoinMetadata,
        lpCoinCode,
    ],
  };
  const txnRequest = await client.generateTransaction(
    account.address(),
    payload
  );
  const signedTxn = await client.signTransaction(account, txnRequest);
  const transactionRes = await client.submitTransaction(signedTxn);
  await client.waitForTransactionWithResult(transactionRes.hash)
      .then((res) => console.log(res.vm_status))
      .catch((e) => console.error(e));

  // deploy DEX module
  shellJs.exec("aptos move compile --save-metadata");

    const dexMetadata = fs.readFileSync("build/MovementDEX/package-metadata.bcs");
    const mathCode = fs.readFileSync("build/MovementDEX/bytecode_modules/math.mv");
    const curvesCode = fs.readFileSync("build/MovementDEX/bytecode_modules/curves.mv");
    const coinHelperCode = fs.readFileSync("build/MovementDEX/bytecode_modules/coin_helper.mv");
    const globalConfigCode = fs.readFileSync("build/MovementDEX/bytecode_modules/global_config.mv");
    const daoStorageCode = fs.readFileSync("build/MovementDEX/bytecode_modules/dao_storage.mv");
    const emergencyCode = fs.readFileSync("build/MovementDEX/bytecode_modules/emergency.mv");
    const stableCurveCode = fs.readFileSync("build/MovementDEX/bytecode_modules/stable_curve.mv");
    const liquidityPoolCode = fs.readFileSync("build/MovementDEX/bytecode_modules/liquidity_pool.mv");
    const routerCode = fs.readFileSync("build/MovementDEX/bytecode_modules/router.mv");
    const scriptsCode = fs.readFileSync("build/MovementDEX/bytecode_modules/scripts.mv");

  let dexPublishTx = await client.publishPackage(
    account,
    new HexString(dexMetadata.toString("hex")).toUint8Array(),
    [
        new aptos.TxnBuilderTypes.Module(new HexString(mathCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(curvesCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(coinHelperCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(globalConfigCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(daoStorageCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(emergencyCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(stableCurveCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(liquidityPoolCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(routerCode.toString("hex")).toUint8Array()),
        new aptos.TxnBuilderTypes.Module(new HexString(scriptsCode.toString("hex")).toUint8Array()),
    ],
  );
  await client.waitForTransactionWithResult(dexPublishTx)
      .then((res) => console.log(res.vm_status))
      .catch((e) => console.error(e));

  // // initialize router v2
  // shellJs.exec("aptos move compile --save-metadata --package-dir movement_dex_router");
  // const routerMetadata = fs.readFileSync("movement_dex_router/build/MovementDEXRouter/package-metadata.bcs");
  // const routerV2Code = fs.readFileSync("movement_dex_router/build/MovementDEXRouter/bytecode_modules/router_v2.mv");
  // const scriptsV2Code = fs.readFileSync("movement_dex_router/build/MovementDEXRouter/bytecode_modules/scripts_v2.mv");
  // const routerV2PublishTx = await client.publishPackage(
  //     account,
  //     new HexString(routerMetadata.toString("hex")).toUint8Array(),
  //     [
  //         new aptos.TxnBuilderTypes.Module(
  //             new HexString(routerV2Code.toString("hex")).toUint8Array()
  //         ),
  //         new aptos.TxnBuilderTypes.Module(
  //             new HexString(scriptsV2Code.toString("hex")).toUint8Array()
  //         ),
  //     ],
  // );
  // await client.waitForTransactionWithResult(routerV2PublishTx)
  //     .then((res) => console.log(res.vm_status))
  //     .catch((e) => console.error(e));


}
