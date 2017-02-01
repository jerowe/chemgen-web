/* @flow */
'use strict';

//TODO divide this up into different queues

module.exports = function(WpPosts /*: any */ ) {
  var app = require('../../server/server.js');
  var slug = require('slug');
  var kue = require('kue');
  var queue = app.queue;
  var AssayPost = require('./Wp-Posts/AssayPost.js');
  var Promise = require('bluebird');

  var helpers = require('./helpers');
  var wpUrl = helpers.wpUrl();
  var wpHelpers = require('./Wp-Posts/WpPosts-helpers');


  //TODO move this to ExperimentPlatePost
  WpPosts.ExperimentPlatePost = function(FormData /*: FormData */ ,
    plateInfo /*: plateInfo */ ) {
    var barcode = plateInfo.barcode;
    var imagePath = plateInfo.imagePath;
    var instrumentPlateId = plateInfo.instrumentPlateId;
    var plateId = plateInfo.experimentPlateId;

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
    titleSlug = titleSlug.toLowerCase();

    //TODO make a helper class
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
    var postObj /*: postObj */ = {
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
      postDate: dateNow,
      postDateGmt: dateNow,
      guid: wpUrl + '/wordpress/' + titleSlug,
    };
    //********************************
    //End write out plate as gallery
    //********************************

    WpPosts
      .create(postObj)
      .then(function(result) {
        return app.models.WpTerms
          .kue(FormData, plateInfo, createTermObjs, result);
      });
  };


  // //TODO MOVE THIS TO IMAGE Post
  // WpPosts.assayImagePost = function(FormData, plateInfo,
  //   createLibrarystockResult,
  //   imagePath, titleSlug, assayPostResult) {
  //   return new Promise(function(resolve, reject) {
  //     var dateNow = new Date().toISOString();
  //     var postObj = {
  //       postAuthor: FormData.wpUI || 1,
  //       postType: 'attachment',
  //       postMimeType: 'image/jpeg',
  //       commentCount: 0,
  //       menuOrder: 0,
  //       postContent: '',
  //       postStatus: 'inherit',
  //       postTitle: assayPostResult.postTitle + '.jpeg',
  //       postName: titleSlug,
  //       postParent: 0,
  //       pingStatus: 'closed',
  //       commentStatus: 'open',
  //       postDate: dateNow,
  //       postDateGmt: dateNow,
  //       guid: wpUrl + '/wp-content/uploads/' + imagePath,
  //     };
  //
  //     //TODO this should be created from the AssayPost
  //     var createTermObjs = helpers.createTags(FormData, plateInfo);
  //
  //     createTermObjs.push({
  //       taxonomy: 'chembridge',
  //       taxTerm: createLibrarystockResult.taxTerm,
  //     });
  //
  //     var baseImage = plateInfo.barcode + '_' + createLibrarystockResult.well + '-autolevel';
  //     var imageMeta = helpers.imageMeta(imagePath, baseImage);
  //
  //
  //
  //     WpPosts
  //       .create(postObj)
  //       .then(function(result) {
  //         // console.log('There is a createTermObjs ' + JSON.stringify(createTermObjs));
  //         // console.log('in result ' + JSON.stringify(result) );
  //         app.models.WpTerms.kue(FormData, plateInfo, createTermObjs, result);
  //
  //         var createObjs = [{
  //           postId: assayPostResult.id,
  //           metaKey: '_thumbnail_id',
  //           metaValue: result.id,
  //         }, {
  //           postId: result.id,
  //           metaKey: '_wp_attached_file',
  //           metaValue: imagePath,
  //         }, {
  //           postId: result.id,
  //           metaKey: '_wp_attachment_metadata',
  //           metaValue: imageMeta,
  //         }];
  //
  //         return app.models.WpPostmeta.assayImageMeta(createObjs);
  //       })
  //       .then(function() {
  //         resolve();
  //       });
  //   });
  // };

  WpPosts.assayPostKue = function(data, ExperimentAssayResult) {
    var FormData = data.FormData;
    var plateInfo = data.plateInfo;
    var LibrarystockResult = data.createLibrarystockResult;

    return new Promise(function(resolve) {
      var queueObj = {
        title: 'ExperimentAssayPost-' + plateInfo.experimentPlateId +
          '-' + plateInfo.barcode + '-' + LibrarystockResult.well,
        FormData: FormData,
        plateInfo: plateInfo,
        createLibrarystockResult: LibrarystockResult,
        createExperimentAssayResult: ExperimentAssayResult,
      };

      queue
        .create('createExperimentAssayPost', queueObj)
        .events(false)
        .priority('high')
        .removeOnComplete(true)
        .ttl(60000)
        .save();

      queue
        .process('createExperimentAssayPost', 1, function(job, done) {
          AssayPost.assayProcessKue(job.data, done);
        });
      resolve(queueObj);
    });
  };
};
