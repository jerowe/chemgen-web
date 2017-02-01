/* @flow */
'use strict';

module.exports = function(WpPostmeta/*: any */) {
  var Promise = require('bluebird');

  WpPostmeta.assayImageMeta = function(createObjs) {
    return new Promise(function(resolve, reject) {
      createObjs.map(function(createObj) {
        WpPostmeta.create(createObj).then(function() {
          resolve();
        }).catch(function(error) {
          reject(error);
        });
      });
    });
  };
};
