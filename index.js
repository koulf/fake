'use strict';

var fs = require('fs');
var path = require('path');

exports.getHome = function (event, context, callback) {
    var contents = fs.readFileSync(`public${path.sep}index.html`);
    let s = event.requestContext.stage;
    if (s != "")
        s = "/" + s;
    var result = {
        statusCode: 200,
        body: contents.toString().replace(/\/{root}/g, s),
        headers: { 'content-type': 'text/html' }
    };

    callback(null, result);
};

exports.getHomeLogged = function (event, context, callback) {
    var contents = fs.readFileSync(`public${path.sep}home.html`);
    let s = event.requestContext.stage;
    if (s != "")
        s = "/" + s;
    var result = {
        statusCode: 200,
        body: contents.toString().replace(/\/{root}/g, s),
        headers: { 'content-type': 'text/html' }
    };

    callback(null, result);
}

exports.getLogin = function (event, context, callback) {
    var contents = fs.readFileSync(`public${path.sep}login.html`);
    let s = event.requestContext.stage;
    if (s != "")
        s = "/" + s;
    var result = {
        statusCode: 200,
        body: contents.toString().replace(/\/{root}/g, s),
        headers: { 'content-type': 'text/html' }
    };

    callback(null, result);
};

exports.getRegister = function (event, context, callback) {
    var contents = fs.readFileSync(`public${path.sep}register.html`);
    let s = event.requestContext.stage;
    if (s != "")
        s = "/" + s;
    var result = {
        statusCode: 200,
        body: contents.toString().replace(/\/{root}/g, s),
        headers: { 'content-type': 'text/html' }
    };

    callback(null, result);
};