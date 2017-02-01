'use strict';

var app = require('../../../server/server.js');
var queue = app.queue;
var Promise = require('bluebird');
var slug = require('slug');
var helpers = require('../helpers.js');
var wpHelpers = require('./WpPosts-helpers');

var createPostObj = function(data) {
  var dateNow = new Date().toISOString();
  var guid = helpers.wpUrl() + '/wp-content/uploads/' + data.imagePath;
  var postObj = {
    postAuthor: data.FormData.wpUI || 1,
    postType: 'attachment',
    postMimeType: 'image/jpeg',
    commentCount: 0,
    menuOrder: 0,
    postContent: '',
    postStatus: 'inherit',
    postTitle: data.assayPostResult.postTitle + '.jpeg',
    postName: data.titleSlug,
    postParent: 0,
    pingStatus: 'closed',
    commentStatus: 'open',
    postDate: dateNow,
    postDateGmt: dateNow,
    guid: guid,
  };

  return postObj;
};

var processImagePost = function(data, result) {
  return new Promise(function(resolve, reject) {
    var createTermObjs = helpers.createTags(data.FormData, data.plateInfo);
    var baseImage = data.plateInfo.barcode + '_' + data.createLibrarystockResult.well + '-autolevel';

    createTermObjs.push({
      taxonomy: 'chembridge',
      taxTerm: data.createLibrarystockResult.taxTerm,
    });
    app.models.WpTerms.kue(FormData, plateInfo, createTermObjs, result);

    var createObjs = [{
      postId: data.assayPostResult.id,
      metaKey: '_thumbnail_id',
      metaValue: result.id,
    }, {
      postId: result.id,
      metaKey: '_wp_attached_file',
      metaValue: data.imagePath,
    }, {
      postId: result.id,
      metaKey: '_wp_attachment_metadata',
      metaValue: '',
    }];

    resolve(app.models.WpPostmeta.assayImageMeta(createObjs));
  });
};

//TODO MOVE THIS TO IMAGE Post
var assayImagePost = function(data) {
  var FormData = data.FormData;
  var plateInfo = data.plateInfo;
  var createLibrarystockResult = data.createLibrarystockResult;
  var imagePath = data.imagePath;
  var titleSlug = data.titleSlug;
  var assayPostResult = data.assayPostResult;

  return new Promise(function(resolve, reject) {

    var postObj = createPostObj(data);

    app.models.WpPosts
      .create(postObj)
      .then(function(result) {
        return processImagePost(data, result);
      })
      .then(function() {
        resolve();
      });
  });
};

module.exports = {
  assayImagePost: assayImagePost,
};
