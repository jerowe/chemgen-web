/* @flow */
'use strict';

//TODO divide this up into different queues

module.exports = function(WpPosts /*: any */ ) {
  var app = require('../../server/server.js');
  var slug = require('slug');
  // var kue = require('kue');
  // var queue = app.queue;
  var AssayPost = require('./Wp-Posts/AssayPost.js');
  var Promise = require('bluebird');
  var agenda = require('../../agenda/worker.js');
  var deepcopy = require('deepcopy');

  var helpers = require('./helpers');
  var wpUrl = helpers.wpUrl();
  var wpHelpers = require('./Wp-Posts/WpPosts-helpers');


  //TODO move this to ExperimentPlatePost
  WpPosts.ExperimentPlatePost = function(FormData,
    plateInfo) {

    var barcode = plateInfo.ExperimentExperimentplate.barcode;
    var imagePath = plateInfo.ExperimentExperimentplate.imagePath;
    var instrumentPlateId = plateInfo.ExperimentExperimentplate.instrumentPlateId;
    var plateId = plateInfo.ExperimentExperimentplate.experimentPlateId;

    var imageArray = imagePath.split('\\');
    var folder = imageArray[4];

    var createTermObjs = helpers.createTags(FormData, plateInfo);

    var well,
      x,
      y,
      imageUrl,
      assayName,
      autoLevelJpegImage;

    var titleSlug = slug(plateId + '-' + barcode);
    titleSlug = titleSlug;

    var rows = helpers.rows();
    var cols = helpers.cols();

    //TODO split these to separate functions
    //********************************
    //Start write out plate as a table
    //********************************
    var postContent = '<table class="table table-reflow">' +
      '<thead> <tr> <th>#</th>';

    for (x = 0; x < cols.length; x++) {
      postContent = postContent + '<th>' + cols[x] + '</th>';
    }

    postContent = postContent + '</tr></thead><tbody>';

    for (x = 0; x < rows.length; x++) {
      postContent = postContent + '<tr>';
      postContent = postContent + '<th scope=\'row\'>' + rows[x] + '</th>';

      for (y = 0; y < cols.length; y++) {
        well = rows[x] + cols[y];
        assayName = barcode + '_' + well;
        autoLevelJpegImage = '/' + folder + '/' + instrumentPlateId +
          '/' + assayName + '-autolevel-300x300.jpeg';
        imageUrl = wpUrl + '/wp-content/uploads/assays' + autoLevelJpegImage;
        postContent = postContent + '<td><img src="' + imageUrl + '" ></td>';
      }

      postContent = postContent + '</tr>';
    }

    postContent = postContent + '</tbody></table>';
    //********************************
    //End write out plate as a table
    //********************************

    //********************************
    //Start write out plate as gallery
    //********************************
    postContent = postContent +
      '<div id="fotorama" class="fotorama">';
    for (x = 0; x < rows.length; x++) {
      for (y = 0; y < cols.length; y++) {
        well = rows[x] + cols[y];
        assayName = barcode + '_' + well;
        autoLevelJpegImage = '/' + folder + '/' + instrumentPlateId + '/' +
          assayName + '-autolevel-300x300.jpeg';
        imageUrl = wpUrl + '/wp-content/uploads/assays' + autoLevelJpegImage;
        postContent = postContent + '<img src="' + imageUrl +
          '"  data-caption="' + well + '" >';
      }
    }

    postContent = postContent + '</div>';
    //********************************
    //End write out plate as gallery
    //********************************

    postContent = postContent + wpHelpers.postInfo(FormData, plateInfo);

    var dateNow = new Date().toISOString();
    var postObjNoDate = {
      postAuthor: FormData.wpUI || 1,
      postType: 'plate',
      commentCount: 0,
      menuOrder: 0,
      postContent: postContent,
      postStatus: 'publish',
      postTitle: titleSlug,
      postName: titleSlug,
      postParent: 0,
      pingStatus: 'open',
      commentStatus: 'open',
      guid: wpUrl + titleSlug,
    };
    var postObjWithDate = deepcopy(postObjNoDate);
    postObjWithDate.postDate = dateNow;
    postObjWithDate.postDateGmt = dateNow;
    //********************************
    //End write out plate as gallery
    //********************************


    return new Promise(function(resolve, reject) {
      WpPosts
        .findOrCreate({
          where: postObjNoDate
        }, postObjWithDate)
        .then(function(results) {
          var result = results[0];
          return app.models.WpTerms
            .kue({
              FormData: FormData,
              plateInfo: plateInfo,
              createTermObjs: createTermObjs
            }, result);
        })
        .then(function(results) {
          resolve();
        })
        .catch(function(error) {
          console.log('Error creating plate post! ' + JSON.stringify(error));
          resolve(new Error(error));
        });
    });
  };

  WpPosts.assayPostKue = function(data, ExperimentAssayResult) {

    var FormData = data.FormData;
    var plateInfo = data.plateInfo;
    var LibrarystockResult = data.createLibrarystockResult;

    return new Promise(function(resolve, reject) {
      var queueObj = {
        title: 'ExperimentAssayPost-' + plateInfo.experimentPlateId +
          '-' + plateInfo.barcode + '-' + LibrarystockResult.well,
        FormData: FormData,
        plateInfo: plateInfo,
        createLibrarystockResult: LibrarystockResult,
        createExperimentAssayResult: ExperimentAssayResult,
      };

      agenda.now('createExperimentAssayPost', queueObj);
      resolve(queueObj);
    });
  };
};
