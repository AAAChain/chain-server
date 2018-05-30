"use strict";

import path from 'path';
import fs from 'fs';
import rfs from 'rotating-file-stream';
import bodyParser from 'body-parser';
import http from 'http';
import express from 'express';
import { Apis, Manager } from 'w3ajs-ws';
import { ChainStore } from 'w3ajs';
import { router } from './routes/api';
import config from 'config';
import logger from 'morgan';
const { AssertionError } = require('assert');
/*
debug exposes a function;
simply pass this function the name of your module,
and it will return a decorated version of console.error for you to pass debug statements to.
*/
require('debug')('chain-server:main');

let logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
let accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
});
// load witness node list from config file
const witnesses = config.get('chain.witness_nodes');

if (witnesses.length === 0) {
    console.error('no config witness node,请先在default.json文件中配置chain.witness_nodes');
    process.exit(1);
}

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// log only 4xx and 5xx responses to console
app.use(logger('dev', {
    skip: function (req, res) { return res.statusCode < 400 }
}));
// log all requests to access.log
app.use(logger('combined', {stream: accessLogStream}));

let connected = false;
const connectedCheck = function (req, res, next) {
    if (connected) {
        next();
    } else {
        res.status(500).send({
            message: 'initializing data, please try later!'
        });
    }
};
// apply the routes to our application
app.use('/api', connectedCheck, router);
app.use(function(err, req, res, next) {
    // Only handle `next(err)` calls
    console.error(err.stack);
    res.status(500).send({ error: err.message });
});
/**
 * 过滤可连接的节点
 * @param latencies
 * @param witnesses
 * @returns {Array.<T>|*}
 */
const filterAndSortURLs = (latencies, witnesses) => {
    return witnesses
        .filter(a => {
            /* Only keep the nodes we were able to connect to */
            return !!latencies[a];
        })
        .sort((a, b) => {
            return latencies[a] - latencies[b];
        });
};
/**
 * 连接witness
 * @param callback
 */
let connect = function (callback) {
    let connectionManager = new Manager({url: witnesses[0], urls: witnesses});
    connectionManager.checkConnections().then((resp) => {
        let urls = filterAndSortURLs(resp, witnesses);
        console.log(urls);
        if (urls.length === 0) {
            console.error('no available connection, try 3 seconds later');
            setTimeout(function () {
                connect(callback);
            }, 3000);
        } else {
            connectionManager.urls = urls;
            connectionManager.connectWithFallback(true).then(() => {
                console.log('connected');
                connected = true;
                callback && callback();
            }).catch((ex) => {
                console.error('failed in connecting, try 3 seconds later', ex.message);
                setTimeout(function () {
                    connect(callback);
                }, 3000);
            });
        }
    }).catch((ex) => {
        console.error('failed to check connection, try 3 seconds later', ex.message);
        setTimeout(function () {
            connect(callback);
        }, 3000);
    });
};
/**
 * 初始化连接
 */
let initConnection = function () {
    console.log('initializing...');
    let promises = [
        ChainStore.init()
    ];
    Promise.all(promises).then(function () {
        console.log('initialization is done');
        startServer();
    }).catch((ex) => {
        console.error('initialize failed, please check:\n1. node data synced \n2. system clock time \n', ex);
    });
};
// websocket 状态处理
Apis.setRpcConnectionStatusCallback(function (status) {
    let statusMap = {
        open: '开启',
        closed: '关闭',
        error: '错误',
        reconnect: '重新连接'
    };
    console.log('witness status:', statusMap[status] || status);
    if (status === 'reconnect') {
        console.log('cutoff connect');
        ChainStore.resetCache();
    } else if (connected && (status === 'closed' || status === 'error')) { // 出错重连
        connected = false;
        console.log('reconnect to the other witness');
        connect(function () {
            ChainStore.subscribed = false;
            ChainStore.subError = null;
            ChainStore.clearCache();
            ChainStore.head_block_time_string = null;
            initConnection();
        });
    }
});
// 首次连接
connect(function () {
    console.log("start connect...");
    initConnection();
});
/**
 * 启动web服务
 */
let serverStarted = false;
let port = parseInt(process.env.port || '3030');
let startServer = function () {
    if (serverStarted) {
        return;
    }
    serverStarted = true;
    app.set('port', port);
    let server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
};
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    console.log('Listening on %s', port);
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError (error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

