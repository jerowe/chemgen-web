module.exports = function(WpPostmeta) {

    //var app = require('../../server/server.js');
    //var kue = require('kue');
    //var queue = kue.createQueue();
    var Promise = require('bluebird');

    WpPostmeta.assayImageMeta = function(createObjs) {

        return new Promise(function(resolve, reject) {

            createObjs.map(function(createObj) {

                WpPostmeta
                    .create(createObj)
                    .then(function() {
                        resolve();
                    })
                    .catch(function(error) {
                        reject(error);
                    });
            });

        });
    };
};
