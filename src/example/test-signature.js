
import {Apis} from "w3ajs-ws";
import Promise from "bluebird";
let Buffer = require("bytebuffer");
let {ChainStore, FetchChain, PrivateKey, key, ops, hash, Signature, TransactionBuilder} = require("w3ajs");

let privKey = "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3";
let pKey = PrivateKey.fromWif(privKey);
console.log(pKey.toPublicKey().toPublicKeyString());
let hexSig = "201aa5cb448b2bf124605bd238e33e0bebee35bb3954312865873d5177bbb45f81789833609103a154eeebc9ac979f16d30230f80382657d280d22bc77cfaa73ca";
let sig = Signature.fromHex(
    hexSig
    );
console.log(sig);

let verified = sig.verifyHex(
    hexSig,
    pKey.toPublicKey()
    );
console.log(verified);


