/* global d3, FormData */
/* jshint latedef:nofunc */
'use strict';

/**
 * IPFS save and load json objects.
 * 
 * @param {type} _publishProviders array of publish providers.
 * @param {type} _publicServers optional list of public IPFS gateways.
 * @returns {new Ipfs() instance}
 */
function Ipfs(_publishProviders, _publicServers) {

    var publicServers = _publicServers ? _publicServers :
            ['https://ipfs.btcgraph.org', 'https://ipfs.io', 'https://ipfs.infura.io', 'https://cloudflare-ipfs.com'];
    var defaultGetAttempts = 5;
    var defaultAddAttempts = 5;
    var defaultProv = {
        url: '',
        pinning: true,
        path: '/api/v0/add'};
    var publishProviders = Array.isArray(_publishProviders) ? _publishProviders.map(function (a) {
        if (typeof a === 'string') {
            a = {url: a};
        }
        return Object.assign(Object.create(defaultProv), a);
    }) : [defaultProv];

    function addData(data, callback, attempts) {
        if (typeof attempts !== 'number') {
            attempts = defaultAddAttempts;
        }
        var formData = new FormData();
        formData.append('path', data);
        var prov = publishProviders[Math.floor(Math.random() * publishProviders.length)];
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
        var url = publicServers[Math.floor(Math.random() * publicServers.length)] + '/ipfs/' + ipfsHash;
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
