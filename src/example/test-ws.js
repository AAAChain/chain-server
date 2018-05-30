
const WebSocket = require('ws');
//let witness = "ws://172.17.1.196:8090";
let witness = "ws://47.98.107.96:21012";
const ws = new WebSocket(witness);

let method_database = {"method":"call","params":[1,"database",[]],"id":1};
let method_login = {"method":"call","params":[1,"login",["",""]],"id":2};
let method_network = {"method":"call","params":[1,"network_broadcast",[]],"id":3};
let method_get_account_by_name = {"method":"call","params":[2,"get_account_by_name",["nathan"]],"id":5};
let method_get_data_assets = {"method":"call","params":[2,"get_data_assets",[["1.16.1"]]],"id":6};
let method_get_core_asset = {"method":"call","params":[2,"lookup_asset_symbols",[["AAA"]]],"id":7};
let method_get_asset_by_name = {"method":"call","params":[2,"list_assets",["EOS", 10]],"id":8};
let method_lookup_assets = {"method":"call","params":[2,"lookup_asset_symbols",[["EOS", "1.3.1"]]],"id":9};
let method_transaction = {"method":"call","params":[3,"broadcast_transaction_with_callback",[13,{"ref_block_num":5382,"ref_block_prefix":4088778371,"expiration":"2018-05-03T06:26:55","operations":[[47,{"fee":{"amount":"0","asset_id":"1.3.0"},"owner":{"weight_threshold":1,"account_auths":[],"key_auths":[["AAA6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",1]],"address_auths":[]},"active":{"weight_threshold":1,"account_auths":[],"key_auths":[["AAA6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",1]],"address_auths":[]},"options":{"memo_key":"AAA6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV","voting_account":"1.2.5","num_witness":0,"num_committee":0,"votes":[],"extensions":[]},"extensions":[]}]],"extensions":[],"signatures":["1f3260c3ef601d65f8fbdd8d9fd4a470f2347e91eb6dacffa28850aa5a5358d1ab4f8440d3be00fb060121b4b397bc417d2bd7e562a90420f10a9925eb442fb746"]}]],"id":13};
ws.on('open', function open() {
    ws.send(JSON.stringify(method_login));
    ws.send(JSON.stringify(method_database));
    ws.send(JSON.stringify(method_network));
    //ws.send(JSON.stringify(method_get_account_by_name));
    //ws.send(JSON.stringify(method_get_data_assets));
    //ws.send(JSON.stringify(method_transaction));
    ws.send(JSON.stringify(method_lookup_assets));
});

ws.on('message', function incoming(data) {
    console.log("received msg from server:");
    data = JSON.parse(data);
    console.log(data);

    //ws.send(JSON.stringify(method_get_core_asset));

});
