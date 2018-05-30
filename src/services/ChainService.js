import Promise from 'bluebird';
import { Apis } from 'w3ajs-ws';
import { ChainStore, FetchChain, PrivateKey, TransactionBuilder, ops, hash } from 'w3ajs';
import Immutable from 'immutable';
import config from 'config';
require('debug')('ChainService');

const registrars = config.get('chain.registrars');
/**
 * @apiDescription get chain properties
 *
 * @apiPermission all
 *
 * @apiName fetch_chain_properties
 * @apiGroup ChainService
 * @apiSuccess properties
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *      "id": "2.11.0",
 *      "chain_id": "b53488471b57c7cd63a42ecefdcd03e9dc9b72d05030233ea601174f4122603f",
 *      "immutable_parameters": {
 *          "min_committee_member_count": 11,
 *          "min_witness_count": 11,
 *          "num_special_accounts": 0,
 *          "num_special_assets": 0
 *      }
 * }
 */
const fetch_chain_properties = () => {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_chain_properties', []).then(function (properties) {
            resolve(properties);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
/**
 * @apiDescription get global properties
 *
 * @apiPermission all
 *
 * @apiName fetch_global_properties
 * @apiGroup ChainService
 * @apiSuccess properties
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *      "id": "2.11.0",
 *      "chain_id": "b53488471b57c7cd63a42ecefdcd03e9dc9b72d05030233ea601174f4122603f",
 *      "immutable_parameters": {
 *          "min_committee_member_count": 11,
 *          "min_witness_count": 11,
 *          "num_special_accounts": 0,
 *          "num_special_assets": 0
 *      }
 * }
 */
const fetch_global_properties = () => {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_global_properties', []).then(function (properties) {
            resolve(properties);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
/**
 * @apiDescription get global properties
 *
 * @apiPermission all
 *
 * @apiName fetch_global_properties
 * @apiGroup ChainService
 * @apiSuccess properties
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *      "id": "2.11.0",
 *      "chain_id": "b53488471b57c7cd63a42ecefdcd03e9dc9b72d05030233ea601174f4122603f",
 *      "immutable_parameters": {
 *          "min_committee_member_count": 11,
 *          "min_witness_count": 11,
 *          "num_special_accounts": 0,
 *          "num_special_assets": 0
 *      }
 * }
 */
const fetch_dynamic_global_properties= () => {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_dynamic_global_properties', []).then(function (properties) {
            resolve(properties);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
/**
 * @apiDescription get objects
 *
 * @apiPermission all
 *
 * @apiName fetch_objects
 * @apiGroup ChainService
 * @apiSuccess objects
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *      {
 *          "id": "2.11.0",
 *          "chain_id": "b53488471b57c7cd63a42ecefdcd03e9dc9b72d05030233ea601174f4122603f",
 *          "immutable_parameters": {
 *              "min_committee_member_count": 11,
 *              "min_witness_count": 11,
 *              "num_special_accounts": 0,
 *              "num_special_assets": 0
 *          }
 *      }
 *      ...
 * ]
 */
const fetch_objects = (ids) => {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_objects', [ids]).then(function (objects) {
            resolve(objects);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
/**
 * @apiDescription lookup assets
 *
 * @apiPermission all
 *
 * @apiName lookup_assets
 * @apiGroup ChainService
 * @sampleUrl /api/assets/EOS:1.3.1
 * @apiSuccess assets
 * @apiSuccessExample {json} Success-Response:
 * [
 *      {
 *          "id": "1.3.1",
 *          "symbol": "EOS",
 *          "precision": 8,
 *          "issuer": "1.2.17",
 *          "options": {
 *              "max_supply": 10000000,
 *              "market_fee_percent": 0,
 *              "max_market_fee": 0,
 *              "issuer_permissions": 9,
 *              "flags": 0,
 *              "core_exchange_rate": {
 *              "base": {
 *                  "amount": 10,
 *                  "asset_id": "1.3.0"
 *              },
 *              "quote": {
 *                  "amount": 10,
 *                  "asset_id": "1.3.1"
 *              }
 *             },
 *              "whitelist_authorities": [],
 *              "blacklist_authorities": [],
 *              "whitelist_markets": [],
 *              "blacklist_markets": [],
 *              "description": "for testing purpose",
 *              "extensions": []
 *          },
 *          "dynamic_asset_data_id": "2.3.1"
 *       }
 * ]
 */
const lookup_assets = (symbol_or_names) => {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('lookup_asset_symbols', [symbol_or_names]).then(function (assets) {
            resolve(assets);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
/**
 * @apiDescription list assets
 *
 * @apiPermission all
 *
 * @apiName list_assets
 * @apiGroup ChainService
 * @sampleUrl /api/assets/EOS/10
 * @apiSuccess assets
 * @apiSuccessExample {json} Success-Response:
 * [
 *      {
 *          "id": "1.3.1",
 *          "symbol": "EOS",
 *          "precision": 8,
 *          "issuer": "1.2.17",
 *          "options": {
 *              "max_supply": 10000000,
 *              "market_fee_percent": 0,
 *              "max_market_fee": 0,
 *              "issuer_permissions": 9,
 *              "flags": 0,
 *              "core_exchange_rate": {
 *              "base": {
 *                  "amount": 10,
 *                  "asset_id": "1.3.0"
 *              },
 *              "quote": {
 *                  "amount": 10,
 *                  "asset_id": "1.3.1"
 *              }
 *             },
 *              "whitelist_authorities": [],
 *              "blacklist_authorities": [],
 *              "whitelist_markets": [],
 *              "blacklist_markets": [],
 *              "description": "for testing purpose",
 *              "extensions": []
 *          },
 *          "dynamic_asset_data_id": "2.3.1"
 *       }
 * ]
 */
const list_assets = (lower_bound_symbol, limit) => {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('list_assets', [lower_bound_symbol, limit]).then(function (assets) {
            resolve(assets);
        }).catch((ex) => {
            reject(ex);
        });
    });
};

const fetch_full_account = (account) => {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_full_accounts', [[account], true])
        .then((account) => {
            resolve(account);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
/**
 * @apiDescription get account balance
 *
 * @apiPermission all
 *
 * @apiName fetch_account_balance
 * @apiGroup ChainService
 * @apiParam {String} [account_name]
 * @apiSuccess balance
 *
 * @apiSuccessExample {json} Success-Response:
 */
const fetch_account_balance = (account_name) => {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_account_by_name', [account_name]).then((account) => {
            return Apis.instance().db_api().exec('get_account_balances', [account.id, []]);
        }).then((balance) => {
            resolve(balance);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
/**
 * @apiDescription get block header
 *
 * @apiPermission all
 *
 * @apiName fetch_blocka_header
 * @apiGroup ChainService
 * @apiParam {Number} [block_height]
 * @apiSuccess block header
 *
 * @apiSuccessExample {json} Success-Response:
 */
const fetch_block_header = function (block_height) {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_block_header', [parseInt(block_height)]).then(function (block) {
            if (!block) {
                resolve(null);
            } else {
                resolve(block);
            }
        }).catch(function (ex) {
            reject(ex);
        });
    });
};
/**
 * @apiDescription get block
 *
 * @apiPermission all
 *
 * @apiName fetch_block
 * @apiGroup ChainService
 * @apiParam {Number} [block_height]
 * @apiSuccess block
 *
 * @apiSuccessExample {json} Success-Response:
 */
const fetch_block = function (block_height) {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_block', [parseInt(block_height)]).then(function (block) {
            if (!block) {
                resolve(null);
            } else {
                resolve(block);
            }
        }).catch(function (ex) {
            reject(ex);
        });
    });
};

/**
 * 供应量查询接口
 */
const fetch_supply = function () {
    return new Promise(function (resolve, reject) {
        Apis.instance().db_api().exec('get_objects', [['2.3.1']]).then(function (resps) {
            resolve(resps[0]);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
// register new account
const register_account = function (account_name, ownerPubKey, activePubKey) {
    let feeAmount = {
        amount: 0,
        asset: "AAA"
    };
    return new Promise(function (resolve, reject) {
        let tr = new TransactionBuilder();
        Promise.all([
            FetchChain("getAccount", registrars[1].account_name),
            FetchChain("getAccount", registrars[1].account_name),
            FetchChain("getAsset", feeAmount.asset)
        ]).then((res) => {
            let [registrarAccount, referrerAccount, feeAsset] = res;
            tr.add_type_operation("account_create", {
                fee: {
                    amount: feeAmount.amount,
                    asset_id: feeAsset.get("id")
                },
                registrar: registrarAccount.get("id"),
                referrer: referrerAccount.get("id"),
                referrer_percent: 0,
                name: account_name,
                owner: {
                    weight_threshold: 1,
                    account_auths: [],
                    key_auths: [[ownerPubKey, 1]],
                    address_auths: []
                },
                active: {
                    weight_threshold: 1,
                    account_auths: [],
                    key_auths: [[activePubKey, 1]],
                    address_auths: []
                },
                options: {
                    memo_key: activePubKey,
                    voting_account: "1.2.5",
                    num_witness: 0,
                    num_committee: 0,
                    votes: []
                }
            });
            let signerPrivateKey = PrivateKey.fromWif(registrars[1].privateKey);
            tr.add_signer(signerPrivateKey);
            return tr.set_required_fees();
        }).then(() => {
            console.log("serialized transaction:", tr.serialize());
            return tr.broadcast();
        }).then((thx) => {
            console.log(JSON.stringify(thx));
            resolve(thx);
        }).catch((ex) => {
            reject(ex);
        });
    });
};
const create_user_issued_asset = function (signedThx) {
    console.log("create_user_issued_asset>");
    console.log(signedThx);
    let objSignedThx = ops.signed_transaction.toObject(signedThx);
    return new Promise((resolve, reject) => {
        Apis.instance()
            .network_api()
            .exec("broadcast_transaction_with_callback", [
                function(res) {
                    return resolve(res);
                },
                objSignedThx
            ])
            .then(function (res) {
                console.log('... broadcast success, waiting for callback');
                console.log(res);
                return objSignedThx;
            })
            .catch(error => {
                // console.log may be redundant for network errors, other errors could occur
                console.log(error);
                let message = error.message;
                if (!message) {
                    message = "";
                }
                reject(
                    new Error(
                        message +
                        "\n" +
                        "aaa-crypto " +
                        " digest " +
                        hash.sha256(this.tr_buffer).toString("hex") +
                        " transaction " +
                        this.tr_buffer.toString("hex") +
                        " " +
                        JSON.stringify(signedThx)
                    )
                );
            });
    });
};

export default {
    fetch_chain_properties,
    fetch_dynamic_global_properties,
    fetch_global_properties,
    fetch_objects,
    list_assets,
    lookup_assets,
    fetch_supply,
    fetch_block_header,
    fetch_block,
    fetch_full_account,
    fetch_account_balance,
    register_account,
    create_user_issued_asset,
};
