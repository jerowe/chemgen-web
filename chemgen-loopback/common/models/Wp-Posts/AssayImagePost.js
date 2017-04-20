'use strict';

var app = require('../../../server/server.js');
// var queue = app.queue;
var Promise = require('bluebird');
var slug = require('slug');
var helpers = require('../helpers.js');
var wpHelpers = require('./WpPosts-helpers');
var WpPosts = app.models.WpPosts;
var deepcopy = require('deepcopy');

/**
 * prepare the object to create the WpPosts
 * @param  {Object} data [FormData, plateInfo, etc]
 * @return {[type]}      [description]
 */
var createPostObj = function(data) {
  var guid = helpers.wpUrl() + '/wp-content/uploads/' + data.imagePath;

  var postObjNoDate = {
    postAuthor: data.FormData.wpUI || 1,
    postType: 'attachment',
    postMimeType: 'image/jpeg',
    commentCount: 0,
    menuOrder: 0,
    postContent: '',
    postStatus: 'inherit',
    postTitle: data.assayPostResult.postTitle + '.jpeg',
    postName: data.postTitle,
    postParent: 0,
    pingStatus: 'closed',
    commentStatus: 'open',
    guid: guid,
  };

  return postObjNoDate;
};

/**
 * Create the terms and send them off to the WpTerms kue
 * @param  {Object} data   [The usual]
 * @param  {WpPostsResult} result [WpPosts result object from the imagePost]
 * @return {[type]}        [description]
 */
var processImagePostTerms = function(data, result) {
  return new Promise(function(resolve, reject) {
    var createTermObjs = data.createTermObjs;
    var baseImage = data.plateInfo.barcode + '_' + data.createLibrarystockResult.well + '-autolevel';

    app.models.WpTerms.kue({
      FormData: data.FormData,
      plateInfo: data.plateInfo,
      createTermObjs: data.createTermObjs
    }, result)
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};

/**
 * create the PostMeta objects and send them off to the PostMeta kue
 * @param  {Object} data   [FormData, plateInfo, etc]
 * @param  {WpPostsResult} result [WpPosts result object from imagePost]
 * @return {[type]}        [description]
 */
var processImagePostPostMeta = function(data, result) {

  return new Promise(function(resolve, reject) {
    var createObjs = [{
      postId: data.assayPostResult.id,
      metaKey: '_thumbnail_id',
      metaValue: result.id,
    }, {
      postId: data.assayPostResult.id,
      metaKey: '_wp_page_template',
      metaValue: 'page-templates/full-width.php',
    },
      {
        postId: result.id,
        metaKey: '_wp_attached_file',
        metaValue: data.imagePath,
      }, {
        postId: result.id,
        metaKey: '_wp_attachment_metadata',
        metaValue: '',
      }];
    //What does this return?
    app.models.WpPostmeta
      .assayImageMeta(createObjs)
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      })
  });
};

/**
 * Once we have an image post, assign the taxonomy tags and postmeta
 * @param  {[type]} data   [description]
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
var processImagePost = function(data, result) {
  return new Promise(function(resolve, reject) {

    processImagePostTerms(data, result)
      .then(function() {
        return processImagePostPostMeta(data, result);
      })
      .then(function() {
        resolve();
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};

var assayImagePost = function(data) {
  //TODO Update ImagePath to use 768 image
  var FormData = data.FormData;
  var plateInfo = data.plateInfo;
  var createLibrarystockResult = data.createLibrarystockResult;
  var imagePath = data.imagePath;
  imagePath.replace('.jpeg', '-768x768.jpeg');
  var postTitle = data.postTitle;
  var assayPostResult = data.assayPostResult;

  return new Promise(function(resolve, reject) {
    var postObj = createPostObj(data);

    var dateNow = new Date().toISOString();
    var postObjWithDate = deepcopy(postObj);
    postObjWithDate.postDate = dateNow;
    postObjWithDate.postDateGmt = dateNow;

    app.models.WpPosts
      .findOrCreate({
        where: postObj
      }, postObjWithDate)
      .then(function(results) {
        var result = results[0];
        // return result;
        return processImagePost(data, result);
      })
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};

module.exports = {
  assayImagePost: assayImagePost,
  createPostObj: createPostObj,
  processImagePost: processImagePost,
  processImagePostTerms: processImagePostTerms,
  processImagePostPostMeta: processImagePostPostMeta,
};
