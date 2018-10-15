/* global d3, FormData */
/* jshint latedef:nofunc */
'use strict';

/**
 * IPFS save and load json objects.
 * 
 * @param {type} _viewServers array of public IPFS gateways.
 * @param {type} _pushServers array of publish providers.
 * @returns {new Ipfs() instance}
 */
function Ipfs(_viewServers, _pushServers) {

    var viewServers = _viewServers ? _viewServers : ['https://cloudflare-ipfs.com'];
    var defaultGetAttempts = 5;
    var defaultAddAttempts = 5;
    var defaultPushServer = {
        url: '',
        pinning: true,
        path: '/api/v0/add'};
    var pushServers = Array.isArray(_pushServers) ? _pushServers.map(function (a) {
        if (typeof a === 'string') {
            a = {url: a};
        }
        return Object.assign(Object.create(defaultPushServer), a);
    }) : [defaultPushServer];

    function addData(data, callback, attempts) {
        if (typeof attempts !== 'number') {
            attempts = defaultAddAttempts;
        }
        var formData = new FormData();
        formData.append('path', data);
        var prov = pushServers[Math.floor(Math.random() * pushServers.length)];
        var url = prov.url + prov.path + (prov.pinning ? '?pin=true' : '');
        console.log("IPFS add url:", url);
        d3.json(url, {
            method: 'POST',
            body: formData
        }).then(function (result) {
            console.log("IPFS add success. result:", result);
            callback(result.Hash);
        }).catch(function (err) {
            console.log("IPFS add error:", err);
            if (attempts > 1) {
                addData(data, callback, attempts - 1);
            } else {
                callback(null);
            }
        });
    }

    function getData(ipfsHash, callback, attempts) {
        if (typeof attempts !== 'number') {
            attempts = defaultGetAttempts;
        }
        var url = viewServers[Math.floor(Math.random() * viewServers.length)] + '/ipfs/' + ipfsHash;
        console.log("IPFS load url:", url);
        d3.json(url)
                .then(callback)
                .catch(function (err) {
                    console.log("IPFS get error:", err);
                    if (attempts > 1) {
                        getData(ipfsHash, callback, attempts - 1);
                    } else {
                        callback(null);
                    }
                });
    }

    return {
        add: addData,
        get: getData
    };
}

module.exports = Ipfs;
