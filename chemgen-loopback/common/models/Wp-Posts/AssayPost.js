'use strict';

var app = require('../../../server/server.js');
var queue = app.queue;
var Promise = require('bluebird');
var slug = require('slug');

var helpers = require('../helpers.js');
//Why doesn't this work?
var WpPosts = app.models.WpPosts;

var AssayImagePost = require('./AssayImagePost');
var wpHelpers = require('./WpPosts-helpers');

var genAssayPostContent = function(data) {
  var FormData = data.FormData;
  var plateInfo = data.plateInfo;
  var createLibrarystockResult = data.createLibrarystockResult;
  var plateId = data.createLibrarystockResult.plateId;
  var createExperimentAssayResult = data.createExperimentAssayResult;

  var createTermObjs = helpers.createTags(FormData, plateInfo);

  createTermObjs.push({
    taxonomy: 'chembridge',
    taxTerm: createLibrarystockResult.taxTerm,
  });

  var wpUrl = helpers.wpUrl();

  var postContent = '<h3>Screen Information</h3><br>';
  var plateUrl = '<a href="' + wpUrl + '/plate/' +
    slug(plateId + '-' + plateInfo.barcode) +
    '/">' + plateInfo.barcode + '</a>';

  postContent = postContent + '<b>Plate View: </b>' + plateUrl + '<br>';
  postContent = postContent + wpHelpers.postInfo(FormData, plateInfo);

  //TODO general function for taxonomy tags
  postContent = postContent + '<h2>Tags</h2>';
  var taxTerm = createLibrarystockResult.taxTerm;
  var taxTermUrl = '<a href="' + wpUrl + '/chembridge/' +
    slug(taxTerm) + '/">' + taxTerm + '</a>';

  postContent = postContent + '<b>Term: </b>' + taxTermUrl + '<br>';

  return {
    postContent: postContent,
    createTermObjs: createTermObjs,
    wpUrl: wpUrl,
  };
};

var genAssayPostMeta = function(data, postMeta) {
  var plateInfo = data.plateInfo;
  var plateId = plateInfo.experimentPlateId;
  var createExperimentAssayResult = data.createExperimentAssayResult;
  var wpUI = postMeta.wpUI;
  var postContent = postMeta.postContent;
  var wpUrl = postMeta.wpUrl;

  var dateNow = new Date().toISOString();
  //Change Title String
  var titleSlug = slug(createExperimentAssayResult.assayName);
  titleSlug = createExperimentAssayResult.assayId + '-' + titleSlug;
  titleSlug = titleSlug.toLowerCase();

  var postObj = {
    postAuthor: wpUI,
    postType: 'assay',
    commentCount: 0,
    menuOrder: 0,
    postContent: postContent,
    postStatus: 'publish',
    postTitle: titleSlug,
    postName: titleSlug,
    postParent: 0,
    pingStatus: 'open',
    commentStatus: 'open',
    postDate: dateNow,
    postDateGmt: dateNow,
    guid: wpUrl + '/' + titleSlug,
  };

  return postObj;
};

var preProcessKue = function(data) {
  var postData = genAssayPostContent(data);
  var createTermObjs = postData.createTermObjs;

  var postMeta = {
    postContent: postData.postContent,
    wpUrl: postData.wpUrl,
    wpUI: data.FormData.wpUI || 1,
  };
  var postObj = genAssayPostMeta(data, postMeta);

  return [postObj, postMeta, createTermObjs];
};

var assayProcessKue = function(data /*: Object */ , done /*: Function */ ) {
  var FormData = data.FormData;
  var plateInfo = data.plateInfo;
  var createLibrarystockResult = data.createLibrarystockResult;
  var createExperimentAssayResult = data.createExperimentAssayResult;

  var postArray = preProcessKue(data);
  var postObj = postArray[0];
  var postMeta = postArray[1];
  var createTermObjs = postArray[2];

  //TODO split this
  app.models.WpPosts
    .create(postObj)
    .then(function(result) {
      //  {FormData: }
      return app.models.WpTerms
        .kue(FormData, plateInfo, createTermObjs, result);
    })
    .then(function(result) {
      return AssayImagePost
        .assayImagePost({
          FormData: FormData,
          plateInfo: plateInfo,
          createLibrarystockResult: createLibrarystockResult,
          imagePath: createExperimentAssayResult.platePath,
          titleSlug: postObj.postTitle,
          assayPostResult: result.createPostResult
        });
    })
    .then(function(results) {
      done();
    })
    .catch(function(error) {
      done(new Error(error));
    });
};

module.exports = {
  assayProcessKue: assayProcessKue,
  genAssayPostMeta: genAssayPostMeta,
  preProcessKue: preProcessKue,
};
