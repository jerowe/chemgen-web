/* @flow */
'use strict';

module.exports = function(WpPostmeta /*: any */ ) {
  var Promise = require('bluebird');

  WpPostmeta.assayImageMeta = function(createObjs) {
    return new Promise(function(resolve, reject) {

      Promise.map(createObjs, function(createObj) {
        WpPostmeta
          .findOrCreate({
            where: createObj
          }, createObj)
      })
        .then(function(results) {
          // var tresult = results[0];
          // var result = tresult.map(function(trow) {
          //   return trow[0];
          // });
          // return result;
          resolve(results);
        })
        // .then(function(results) {
        //   resolve(results);
        // })
        .catch(function(error) {
          reject(new Error(error));
        });

    });
  };
};
