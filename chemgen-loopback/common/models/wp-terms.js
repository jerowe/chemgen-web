'use strict';

module.exports = function(WpTerms) {

  var app = require('../../server/server.js');
  var queue = app.queue;
  var Promise = require('bluebird');
  var slug = require('slug');

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
      }).then(function() {
        resolve(wanted);
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

      app.models.WpTerms.find({
        where: createTermObj
      }).then(function(results) {
        resolve(results);
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

      var createTerm = {
        name: createTermObj.taxTerm,
        slug: slug(createTermObj.taxTerm),
        termGroup: 0
      };

      app.models.WpTerms.findOrCreate({
        where: createTerm
      }, createTerm).then(function() {
        return checkFind(createTerm);
      }).then(function(results) {
        return deleteExtra(results);
      }).then(function(wanted) {
        wanted.taxonomy = createTermObj.taxonomy;
        wanted.taxTerm = createTermObj.taxTerm;
        wanted.postId = postId;
        return app.models.WpTermTaxonomy.kue(wanted);
      }).then(function() {
        resolve();
      });

    });
  }

  WpTerms.processKue = function(data, done) {

    var postId = data.postId;
    var createTermObjs = data.createTerms;

    return new Promise(function(resolve, reject) {

      Promise.map(createTermObjs, function(createTermObj) {
        createTermObj = checkTaxTerm(createTermObj);
        return findDuplicates(postId, createTermObj);
      }).then(function() {
        done();
      }).catch(function(error) {
        console.error('WpTerms.processKue ' + error);
        console.error(error.stack);
        return done(new Error(error));
      });

    });

  };

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

  //TODO get rid of plateInfo
  /**
   * [Submit wpterms to kue]
   * @param  {[object]} FormData         [data experiment_input is sent with]
   * @param  {[object]} plateInfo        [a row from ExperimentExperimentPlate]
   * @param  {[object]} createTerms      [object of arrays with term, taxterm]
   * @param  {[object]} createPostResult [row of WpPosts]
   * @return {[null promise]}                  [return promise - might add as remote method]
   */
  WpTerms.kue = function(FormData, plateInfo, createTerms, createPostResult) {
    return new Promise(function(resolve) {
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

      queue
        .create('createWpTerms', queueObj)
        .events(false)
        .priority('low')
        .removeOnComplete(true)
        .ttl(60000)
        .save();

      queue.process('createWpTerms', 1, function(job, done) {
        WpTerms.processKue(job.data, done);
      });

      resolve(queueObj);
    });
  };
};
