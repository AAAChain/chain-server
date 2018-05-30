import {Apis} from "w3ajs-ws";
import Promise from "bluebird";
import {Long} from "bytebuffer"; // use buffer
let {ChainStore, FetchChain, PrivateKey, key, Aes, ops, hash, Signature, TransactionHelper, TransactionBuilder} = require("w3ajs");

//let witness = "ws://47.98.107.96:21012";
let witness = "ws://172.17.1.196:8091";
//let witness = "ws://127.0.0.1:11012";

let privKeyStr = "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3";
let pKeyNathan = PrivateKey.fromWif(privKeyStr);
console.log(pKeyNathan.toPublicKey().toPublicKeyString());


function generateKeyFromPassword(accountName, role, password) {
    let seed = accountName + role + password;
    let privKey = PrivateKey.fromSeed(seed);
    let pubKey = privKey.toPublicKey().toString();

    return {privKey, pubKey};
}

let fromAccountInfo = {
    accountName: "nathan",
    pKey: pKeyNathan
};
let ownerAccountInfo = fromAccountInfo;


let seed = "Leavkerkrf beautiful be a hello in the southwest of the cannon gun go them city the atmosphere from the waters";
let privatekey = PrivateKey.fromSeed( key.normalize_brainKey(seed) );
console.log(privatekey.toPublicKey().toPublicKeyString());

Apis.instance(witness, true).init_promise.then((res) => {


    //console.log("connected to:", res[0]);
    /*
    get_account_by_name("nathan").then(account => {
        console.log(account);
    });


    get_data_assets_by_id('1.16.1').then(data_assets => {
        console.log("get data assets:")
       console.log(data_assets);
    });
    */

    ChainStore.init(false).then(() => {
        //create_account("nathan", "nathan", 50, "tester-031", privatekey.toPublicKey(), privatekey.toPublicKey());
        //create_data_asset(ownerAccountInfo, "hello", "hello", {amount:10, asset:"AAA"}, ownerAccountInfo.pKey.toPublicKey(), ownerAccountInfo.pKey.toPublicKey());
        //data_asset_update("nathan", pKey.toPublicKey());
        //transfer_data_from_to(fromAccount, "tester-031", "1.3.1", "AAA", 500, new Buffer("hello Johnson"));
    });
    transfer_data_from_to(fromAccountInfo, "tester007", "1.16.0", "AAA", 500, new Buffer("hello Johhson"))
    then(result => {
        console.log(result);
    }).catch(error => {
        console.log("order error:", error);
    });
});

function get_data_assets_by_id(data_asset_id) {
    return new Promise( function(resolve, reject) {
        Apis.instance().db_api().exec( "get_data_assets", [ data_asset_id ]).then(function(assets) {
            resolve(assets);
        })
    })
}

function create_data_asset(ownerAccountInfo, dataHash, dataKey, price, ownerPubkey, activePubkey) {
    let feeAmount = {
        amount: 0,
        asset: "AAA"
    };
    Promise.all([
        FetchChain("getAccount", ownerAccountInfo.accountName),
        FetchChain("getAsset", feeAmount.asset),
        FetchChain("getAsset", price.asset)
    ]).then((res)=> {
        console.log("create_data_asset:", res);
        let [ownerAccount, feeAsset, priceAsset] = res;

        let tr = new TransactionBuilder();
        tr.add_type_operation( "data_asset_create", {
            fee: {
                amount: 0,
                asset_id: feeAsset.get("id")
            },
            ownerId: ownerAccount.get("id"),
            url: "test",
            data_desc: "test",
            data_hash: dataHash,
            data_key: dataKey,
            data_size: 10,
            price: {
                amount: price.amount,
                asset_id: priceAsset.get("id")
            },
            owner: {
                weight_threshold: 1,
                account_auths: [],
                key_auths: [[ownerPubkey, 1]],
                address_auths: []
            },
            active: {
                weight_threshold: 1,
                account_auths: [],
                key_auths: [[activePubkey, 1]],
                address_auths: []
            },
            extensions: null
        });
        tr.set_required_fees().then(() => {
            tr.add_signer(ownerAccountInfo.pKey);
            console.log("serialized transaction:", tr.serialize());
            tr.broadcast();
        })
    });
}

function data_asset_update(ownerName, ownerPubkey) {
    let feeAmount = {
        amount: 0,
        asset: "AAA"
    };
    Promise.all([
        FetchChain("getAccount", ownerName),
        FetchChain("getAsset", feeAmount.asset)
    ]).then((res)=> {
        // console.log("got data:", res);
        let [ownerAccount, feeAsset] = res;
        let tr = new TransactionBuilder();
        tr.add_type_operation( "data_asset_update", {
            fee: {
                amount: 0,
                asset_id: feeAsset.get("id")
            },
            ownerId: ownerAccount.get("id"),
            owner: {
                weight_threshold: 1,
                account_auths: [],
                key_auths: [[ownerPubkey, 1]],
                address_auths: []
            },
            active: {
                weight_threshold: 1,
                account_auths: [],
                key_auths: [[ownerPubkey, 1]],
                address_auths: []
            },
            extensions: null
        });
        tr.set_required_fees().then(() => {
            tr.add_signer(pKey);
            console.log("serialized transaction:", tr.serialize());
            tr.broadcast();
        })
    });
}

function transfer_data_from_to(fromAccountInfo, toAccountName, dataAssetId, assetSymbol, amount, memoBuffer) {
    ChainStore.init().then(() => {
        let fromAccountName = fromAccountInfo.accountName;
        let memoSenderName = fromAccountName;
        let memo = memoBuffer;
        let sendAmount = {
            amount: amount,
            asset: assetSymbol
        };
        Promise.all([
            FetchChain("getAccount", fromAccountName),
            FetchChain("getAccount", toAccountName),
            FetchChain("getAccount", memoSenderName),
            FetchChain("getAsset", sendAmount.asset),
            FetchChain("getAsset", sendAmount.asset),
            FetchChain("getObject", dataAssetId)
        ]).then((res) => {
            // console.log("got data:", res);
            let [fromAccount, toAccount, memoSender, sendAsset, feeAsset, dataAssset] = res;
            // Memos are optional, but if you have one you need to encrypt it here
            let memoFromKey = memoSender.getIn(["options", "memo_key"]);
            console.log("memo pub key:", memoFromKey);
            let memoToKey = toAccount.getIn(["options", "memo_key"]);
            console.log("memo to key:", memoToKey);
            let nonce = TransactionHelper.unique_nonce_uint64();
            console.log("---------------------------------")
            console.log(fromAccountInfo.pKey);
            console.log(memo);
            let memo_object = {
                from: memoFromKey,
                to: memoToKey,
                nonce,
                message: Aes.encrypt_with_checksum(
                    fromAccountInfo.pKey,
                    memoToKey,
                    nonce,
                    memo
                )
            };
            let tr = new TransactionBuilder();
            tr.add_type_operation("data_transfer", {
                fee: {
                    amount: 0,
                    asset_id: feeAsset.get("id")
                },
                from: fromAccount.get("id"),
                to: toAccount.get("id"),
                data_asset_id: dataAssset.get("id"),
                amount: {amount: sendAmount.amount, asset_id: sendAsset.get("id")},
                memo: memo_object
            });
            tr.set_required_fees().then(() => {
                tr.add_signer(fromAccountInfo.pKey);
                console.log("serialized transaction:", tr.serialize());
                tr.broadcast();
            })
        });
    });
}