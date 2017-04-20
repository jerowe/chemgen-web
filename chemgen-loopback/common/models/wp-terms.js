'use strict';

module.exports = function(WpTerms) {

  var app = require('../../server/server.js');
  // var queue = app.queue;
  var Promise = require('bluebird');
  var slug = require('slug');
  var agenda = app.agenda;

  /**
 * [shift the first element of the results, and delete the rest]
 * @param  {[AoO]} results [AofO from Wp.find]
 * @return {[object]}         [first object from Wp.find]
 */
  function deleteExtra(results) {
    var wanted = results.shift();

    return new Promise(function(resolve, reject) {
      Promise.map(results, function(result) {
        return app.models.WpTerms.destroyById(result.termId);
      })
        .then(function() {
          resolve(wanted);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    });
  }

  /**
   * [findOrCreate sometimes keeps creating, no matter how many limits I put. We will widdle it down to just one.]
   * @param  {[object]} createTermObj [check the object from findOrCreate to make sure we only have one]
   * @return {[AoO]}               [array of objects matching input criteria]
   */
  function checkFind(createTermObj) {

    return new Promise(function(resolve, reject) {
      app.models.WpTerms
        .find({
          where: createTermObj
        })
        .then(function(results) {
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        });

    });
  }

  /**
   * [This is a hacky solution for the fact that loopback is too fast for its own good.]
   * @param  {[type]} createTermObj [description]
   * @return {[object]}               [return the first object]
   */
  function findDuplicates(postId, createTermObj) {

    return new Promise(function(resolve, reject) {

      if (typeof createTermObj.taxTerm === 'undefined' || createTermObj.taxTerm === null) {
        resolve({});
      }

      var createTerm = {
        name: createTermObj.taxTerm,
        slug: slug(createTermObj.taxTerm) || '',
        termGroup: 0
      };

      if (createTerm.name) {
        app.models.WpTerms
          .findOrCreate({
            where: createTerm
          }, createTerm)
          .then(function() {
            return checkFind(createTerm);
          })
          .then(function(results) {
            return deleteExtra(results);
          })
          .then(function(wanted) {
            wanted.postId = postId;
            wanted.taxonomy = createTermObj.taxonomy;
            // console.log('wanted is ' + JSON.stringify(wanted));
            resolve(wanted);
          })
          .catch(function(error) {
            reject(new Error(error));
          });
      } else {
        resolve({});
      }

    });
  }

  /**
   * [check to to make sure taxterm is defined -otherwise its taxonomy_empty]
   * @param  {[object]} createTermObj [taxterm, taxonomy]
   * @return {[object]}               [taxterm, taxonomy]
   */
  function checkTaxTerm(createTermObj) {
    if (!createTermObj.taxTerm) {
      createTermObj.taxTerm = createTermObj.taxonomy + '_empty';
    }
    return createTermObj;
  }

  WpTerms.postProcess = function(data) {
    return new Promise(function(resolve, reject) {
      app.models.WpTermTaxonomy
        .kue(data)
        .then(function(results) {
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    });
  };

  WpTerms.preProcessKue = function(data) {
    return new Promise(function(resolve, reject) {
      Promise.map(data.createTerms, function(createTermObj) {
        return findDuplicates(data.postId, createTermObj);
      })
        .then(function(results) {
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    });
  };

  WpTerms.processKue = function(data, done) {

    var postId = data.postId;
    var createTermObjs = data.createTerms;

    WpTerms.preProcessKue(data)
      .then(function(results) {
        return WpTerms.postProcess(results);
      })
      .then(function(results) {
        done();
      })
      .catch(function(error) {
        return done(new Error(error));
      });
  };

  //TODO get rid of plateInfo
  /**
   * @param  {[object]} FormData         [data experiment_input is sent with]
   * @param  {[object]} plateInfo        [a row from ExperimentExperimentPlate]
   * @param  {[object]} createTerms      [object of arrays with term, taxterm]
   * @param  {[object]} createPostResult [row of WpPosts]
   * @return {[null promise]}                  [return promise - might add as remote method]
   */
  WpTerms.kue = function(data, createPostResult) {
    var FormData = data.FormData;
    var plateInfo = data.plateInfo;
    var createTerms = data.createTermObjs;

    return new Promise(function(resolve, reject) {
      //TODO get this from the function we can process many things here
      var title = [
        'WpTerm-',
        plateInfo.experimentPlateId,
        plateInfo.barcode,
        '-Post',
        createPostResult.id,
      ].join('');
      var queueObj = {
        title: title,
        FormData: FormData,
        plateInfo: plateInfo,
        postId: createPostResult.id,
        createTerms: createTerms,
        createPostResult: createPostResult,
      };

      agenda.now('createWpTerms', queueObj);
      resolve(queueObj);
    });
  };
};
