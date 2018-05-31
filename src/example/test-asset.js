import {Apis} from "w3ajs-ws";
import Promise from "bluebird";
import {Long} from "bytebuffer"; // use buffer
let {ChainStore, FetchChain, PrivateKey, key, Aes, ops, hash, Signature, TransactionHelper, TransactionBuilder} = require("w3ajs");

let witness = "ws://47.98.107.96:21012";
//let witness = "ws://172.17.1.196:8091";
//let witness = "ws://127.0.0.1:11012";

let privKeyStrShen = "5JWphEoejRfRM1i4Aqep4QhcvNotGfZBwHUjmPt1fSMaLg37FPM";
let pKeyShen = PrivateKey.fromWif(privKeyStrShen);


let privKeyStr = "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3";
let pKeyNathan = PrivateKey.fromWif(privKeyStr);
console.log(pKeyNathan.toPublicKey().toPublicKeyString());

let fromAccountInfo = {
    accountName: "nathan",
    pKey: pKeyNathan
};
let shenAccountInfo = {
    accountName: "shenbaiwan",
    pKey: pKeyShen
};

let issuerAccount = fromAccountInfo;
Apis.instance(witness, true).init_promise.then((res) => {
    console.log("connected to:", res[0]);
    /*
    create_asset(issuerAccount, "FTXCOIN", setup_asset_options(), false)
    .then((thx) => {
        console.log("transaction of creating UIA was done");
        console.log(JSON.stringify(thx));
    }).catch(ex => {
        console.log(ex);
    });
    */
    transfer_asset_from_to(shenAccountInfo, "nathan", "AAA", 200000, 'hello')
    .then((thx) => {
        console.log("transaction of transfer asset was done");
        console.log(JSON.stringify(thx));
    }).catch(ex => {
        console.log(ex);
    });
});

function setup_asset_options() {
    let permissions = {"charge_market_fee" : true,
        "white_list" : true,
        "override_authority" : true,
        "transfer_restricted" : true,
        "disable_force_settle" : true,
        "global_settle" : true,
        "disable_confidential" : true,
        "witness_fed_asset" : true,
        "committee_fed_asset" : true,
    };
    let flags = {"charge_market_fee" : false,
        "white_list" : false,
        "override_authority" : false,
        "transfer_restricted" : false,
        "disable_force_settle" : false,
        "global_settle" : false,
        "disable_confidential" : false,
        "witness_fed_asset" : false,
        "committee_fed_asset" : false,
    };
    let permissions_int = 0;
    Object.keys(permissions).forEach(function(perm) {
        permissions_int += permissions[perm];
    });
    let flags_int = 0;
    Object.keys(flags).forEach(function(flag) {
        flags_int += flags[flag];
    });
    return {
        issuer_permissions: permissions_int,
        flags : flags_int,
        max_supply: 10000000,
        market_fee_percent: 0,  // integer
        max_market_fee: 0,
        core_exchange_rate: {
            base: {
                amount: 10,
                asset_id: "1.3.0"
            },
            quote: {
                amount: 10,
                asset_id: "1.3.1"
            }
        },
        whitelist_authorities: [],
        blacklist_authorities: [],
        whitelist_markets: [],
        blacklist_markets: [],
        description: "for testing purpose",
        extensions: null
    };
}
function create_asset(issuer, symbol, options, is_prediction_market) {
    return new Promise(function (resolve, reject) {
        ChainStore.init(false).then(() => {
            let feeAmount = {
                amount: 0,
                asset: "AAA"
            };
            let tr = new TransactionBuilder();
            Promise.all([
                FetchChain("getAccount", issuer.accountName),
                FetchChain("getAsset", feeAmount.asset)
            ]).then((res) => {
                // console.log("got data:", res);
                let [issuerAccount, feeAsset] = res;
                tr.add_type_operation("asset_create", {
                    fee: {
                        amount: 0,
                        asset_id: feeAsset.get("id")
                    },
                    symbol: symbol,
                    issuer: issuerAccount.get("id"),
                    precision: 8,
                    common_options: options,
                    is_prediction_market: is_prediction_market,
                    extensions: null
                });
                return tr.set_required_fees();
            }).then(() => {
                tr.add_signer(issuer.pKey);
                return tr.broadcast();
            }).then((thx) => {
                resolve(thx);
            }).catch((ex) => {
                reject(ex);
            });
        });
    });
}
// callback function called after transaction has been sent to chain node
function callback_thx_broadcast_ok(id) {
    console.log("transaction - " + id + " has been sent to chain network.");
}
function transfer_asset_from_to(sender, toAccountName, assetSymbol, amount, memo) {
    return new Promise(function (resolve, reject) {
        ChainStore.init().then(() => {
            let fromAccountName = sender.accountName;
            let memoSenderName = fromAccountName;
            let sendAmount = {
                amount: amount,
                asset: assetSymbol
            };
            let tr = new TransactionBuilder();
            Promise.all([
                FetchChain("getAccount", fromAccountName),
                FetchChain("getAccount", toAccountName),
                FetchChain("getAccount", memoSenderName),
                FetchChain("getAsset", sendAmount.asset),
                FetchChain("getAsset", sendAmount.asset)
            ]).then((res) => {
                // console.log("got data:", res);
                let [fromAccount, toAccount, memoSender, sendAsset, feeAsset] = res;
                if(typeof memo === 'string' || memo instanceof String)
                   memo = new Buffer(memo);
                // Memos are optional, but if you have one you need to encrypt it here
                let memoFromKey = memoSender.getIn(["options", "memo_key"]);
                console.log("memo pub key:", memoFromKey);
                let memoToKey = toAccount.getIn(["options", "memo_key"]);
                console.log("memo to key:", memoToKey);
                let nonce = TransactionHelper.unique_nonce_uint64();

                let memo_object = {
                    from: memoFromKey,
                    to: memoToKey,
                    nonce,
                    message: Aes.encrypt_with_checksum(
                        sender.pKey,
                        memoToKey,
                        nonce,
                        memo
                    )
                };
                tr.add_type_operation("transfer", {
                    fee: {
                        amount: 0,
                        asset_id: feeAsset.get("id")
                    },
                    from: fromAccount.get("id"),
                    to: toAccount.get("id"),
                    amount: {amount: sendAmount.amount, asset_id: sendAsset.get("id")},
                    memo: memo_object
                });
                tr.add_signer(sender.pKey);
                return tr.set_required_fees();
            }).then(() => {
                return tr.broadcast(callback_thx_broadcast_ok);
            }).catch((ex) => {
                reject(ex);
            });
        });
    });
}

