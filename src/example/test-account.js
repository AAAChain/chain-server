import {Apis} from "w3ajs-ws";
import Promise from "bluebird";
import {Long} from "bytebuffer"; // use buffer
let {ChainStore, FetchChain, PrivateKey, key, Aes, ops, hash, Signature, TransactionHelper, TransactionBuilder} = require("w3ajs");

let witness = "ws://47.98.107.96:21012";
//let witness = "ws://172.17.1.196:8091";
//let witness = "ws://127.0.0.1:11012";

let privKeyStr = "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3";
let pKeyAdmin = PrivateKey.fromWif(privKeyStr);
console.log(pKeyAdmin.toPublicKey().toPublicKeyString());

function generateKeyFromPassword(accountName, role, password) {
    let seed = accountName + role + password;
    let privKey = PrivateKey.fromSeed(seed);
    let pubKey = privKey.toPublicKey().toString();

    return {privKey, pubKey};
}

let RegistarAccountInfo = {
    accountName: "nathan",
    pKey: PrivateKey.fromWif("5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3")
};
let ReferrerAccountName = "nathan";

let newAccount = {
    accountName: "tester-007",
    password: "123456",
    ownerKey: generateKeyFromPassword("tester-007", "owner", "123456"),
    activeKey: generateKeyFromPassword("tester-007", "active", "123456")
};
console.log(newAccount.ownerKey.pubKey);
console.log(RegistarAccountInfo.pKey.toPublicKey().toPublicKeyString());

Apis.instance(witness, true).init_promise.then((res) => {
    console.log("connected to:", res[0]);
    /*
    get_account_by_name("nathan").then(account => {
        console.log(account);
    });
    get_data_assets_by_id('1.16.1').then(data_assets => {
        console.log("get data assets:")
       console.log(data_assets);
    });
    */
    create_account(RegistarAccountInfo, ReferrerAccountName, 50, newAccount.accountName, newAccount.ownerKey.pubKey, newAccount.activeKey.pubKey)
    .then((thx) => {
        console.log("thx of creating new account is done");
        console.log(JSON.stringify(thx));
    }).catch(ex => {
        console.log("error happened.");
        console.log(ex);
    });

});

function create_account(registrar, referrerAccountName, referrerPercent, newAccountName, ownerPubkey, activePubkey) {
    return new Promise(function (resolve, reject) {
        ChainStore.init(false).then(() => {
            let feeAmount = {
                amount: 0,
                asset: "AAA"
            };
            let tr = new TransactionBuilder();
            Promise.all([
                FetchChain("getAccount", registrar.accountName),
                FetchChain("getAccount", referrerAccountName),
                FetchChain("getAsset", feeAmount.asset)
            ]).then((res) => {
                // console.log("got data:", res);
                let [registrarAccount, referrerAccount, feeAsset] = res;
                tr.add_type_operation("account_create", {
                    fee: {
                        amount: 0,
                        asset_id: feeAsset.get("id")
                    },
                    registrar: registrarAccount.get("id"),
                    referrer: referrerAccount.get("id"),
                    referrer_percent: referrerPercent,
                    name: newAccountName,
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
                    options: {
                        memo_key: activePubkey,
                        voting_account: "1.2.5",
                        num_witness: 0,
                        num_committee: 0,
                        votes: []
                    }
                });
                return tr.set_required_fees();
            }).then(() => {
                tr.add_signer(registrar.pKey);
                return tr.broadcast();
            }).then((thx) => {
                resolve(thx);
            }).catch(ex => {
                reject(ex);
            });
        });
    });
}