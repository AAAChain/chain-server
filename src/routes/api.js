import express from 'express';
import chainService from '../services/ChainService';

export const router = express.Router();

// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});
// get chain properties
router.get('/property/chain', function (req, res, next) {
    chainService.fetch_chain_properties()
    .then(function (properties) {
        res.send(properties);
    }).catch(ex => {
        next(ex);
    });
});
// get chain global properties - object id: 2.0.0
router.get('/property/global/immutable', function (req, res, next) {
    chainService.fetch_global_properties()
    .then(function (properties) {
        res.send(properties);
    }).catch(ex => {
        next(ex);
    });
});
// get global dynamic properties - object id: 2.0.0
router.get('/property/global/dynamic', function (req, res, next) {
    chainService.fetch_dynamic_global_properties()
    .then(function (properties) {
        res.send(properties);
    }).catch(ex => {
        next(ex);
    });
});
// list assets by name
router.get('/assets/:symbol([A-Za-z]+)/:limit(\\d+)', function (req, res, next) {
    chainService.list_assets(req.params.symbol, parseInt(req.params.limit))
    .then((assets) => {
        res.send(assets);
    }).catch(ex => {
        next(ex);
    });
});
// lookup objects by ids
router.get('/objects/:ids', function (req, res, next) {
    // filter out empty string
    let ids = req.params.ids.split(":").filter(function(id) {
        return id.length > 0;
    });
    chainService.fetch_objects(ids)
    .then((objects) => {
        res.send(objects);
    }).catch(ex => {
        next(ex);
    });
});
// lookup assets by names or ids
router.get('/assets/:symbols', function (req, res, next) {
    // filter out empty string
    let symbols_or_ids = req.params.symbols.split(":").filter(function(symbol) {
        return symbol.length > 0;
    });
    chainService.lookup_assets(symbols_or_ids)
    .then((assets) => {
        res.send(assets);
    }).catch(ex => {
        next(ex);
    });
});
/**
 * block header view
 */
router.get('/block_header/:block_height', function (req, res, next) {
    chainService.fetch_block_header(req.params.block_height)
    .then((block) => {
        res.send(block);
    }).catch(ex => {
        next(ex);
    });
});
/**
 * block view
 */
router.get('/block/:block_height', function (req, res, next) {
    chainService.fetch_block(req.params.block_height)
    .then((block) => {
        res.send(block);
    }).catch(ex => {
        next(ex);
    });
});
/**
 * 账户查询
 */
router.get('/account/:account_id_or_name', function (req, res, next) {
    chainService.fetch_full_account(req.params.account_id_or_name)
    .then((account) => {
        res.send(account.length > 0 ? account[0][1] : {});
    }).catch(ex => {
        next(ex);
    });
});
/**
 * 账户余额查询
 */
router.get('/account_balance/:account_id_or_name', function (req, res, next) {
    chainService.fetch_account_balance(req.params.account_id_or_name)
    .then((balances) => {
        res.send(balances);
    }).catch(ex => {
        next(ex);
    });
});
router.post('/account/', function (req, res, next) {
    let account_name = req.body.account_name;
    let pub_key = req.body.pub_key;
    console.log(req.body);

    chainService.register_account(account_name, pub_key)
    .then(signedTHX => {
        res.send(signedTHX);
    }).catch(ex => {
        next(ex);
    });
});