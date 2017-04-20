'use strict';

var app = require('../../../server/server.js');
// var queue = app.queue;
var Promise = require('bluebird');
var slug = require('slug');
var deepcopy = require('deepcopy');

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
  var well = createLibrarystockResult.well;

  var createTermObjs = helpers.createTags(FormData, plateInfo);

  var altBarcode = data.plateInfo.barcode.replace('_D', '');
  createTermObjs.push({
    taxonomy: 'alt_barcode',
    taxTerm: altBarcode,
  });
  createTermObjs.push({
    taxonomy: 'envira-tag',
    taxTerm: altBarcode,
  });

  var longWell = altBarcode + '_' + well;
  createTermObjs.push({
    taxonomy: 'long_well',
    taxTerm: longWell,
  });
  createTermObjs.push({
    taxonomy: 'envira-tag',
    taxTerm: longWell,
  });

  createLibrarystockResult.taxTerms.map(function(createTerm) {
    createTermObjs.push(createTerm);
    createTermObjs.push({
      taxonomy: 'envira-tag',
      taxTerm: createTerm.taxTerm
    });
  });

  console.log('CreateTerm Objs are ' + JSON.stringify(createTermObjs));
  //TODO Update ChemicalLibrarystock to have TaxTerms array in result
  // createTermObjs.push({
  //   taxonomy: 'chembridge',
  //   taxTerm: createLibrarystockResult.taxTerm,
  // });

  var wpUrl = helpers.wpUrl();

  var postContent = '<h3>Screen Information</h3><br>' + "\n\n";
  var plateUrl = '<a href="' + wpUrl + '/plate/' +
    slug(plateId + '-' + plateInfo.ExperimentExperimentplate.barcode) +
    '/">' + plateInfo.ExperimentExperimentplate.barcode + '</a>' + "\n\n";

  postContent = postContent + '<b>Plate View: </b>' + plateUrl + '<br>' + "\n\n";
  // postContent = postContent + wpHelpers.postInfo(FormData, plateInfo) + "\n\n";

  //Output tags as a table
  postContent = postContent + '<h2>Tags</h2>';

  postContent = postContent + "<table class=\"responsive\">\n";
  postContent = postContent + "<tbody>\n";
  createTermObjs.map(function(createTermObj) {
    if (createTermObj.taxonomy.match('envira')) {
      return;
    }
    postContent = postContent + "<tr>\n";
    var taxTerm = createTermObj.taxTerm;
    var taxTermUrl = '<a href="' + wpUrl + '/' + createTermObj.taxonomy + '/' +
      slug(taxTerm) + '/">' + taxTerm + '</a>';

    postContent = postContent + '<td><b>';
    postContent = postContent + createTermObj.taxonomy.replace(/\b\w/g, function(l) {
      return l.toUpperCase()
    });
    postContent = postContent + '</b></td><td>' + taxTermUrl + '</td>' + "\n";
    postContent = postContent + "</tr>\n";
  });
  postContent = postContent + "</tbody>\n";
  postContent = postContent + "</table>\n\n\n";

  //List all the other Images
  if (!createLibrarystockResult.geneName.match('empty')) {
    console.log('We have a gene name ' + createLibrarystockResult.geneName);
    var geneName = slug(createLibrarystockResult.geneName);
    var postTable = [
      " [posts_table columns=\"image,title,tax:condition:Condition,tax:worm_strain:Strain\"",
      " post_type=\"assay\" term=\"wb_sequence_id:",
      geneName,
      "+screen_name:",
      slug(FormData.screenName),
      "\" lazy_load=\"true\" links=\"title,image\" image_size=\"large\" ",
      " widths=\"50,20,20,10\"]",
      "\n\n",
    ].join('');
    postContent = postContent + postTable;
    postTable = [
      " [posts_table columns=\"title,tax:wb_cosmid_id,tax:wb_sequence_id\"",
      " post_type=\"wb_fn_desc\" term=\"wb_sequence_id:",
      geneName,
      "\" lazy_load=\"true\" links=\"title\"",
      "]",
      "\n\n",
    ].join('');
    postContent = postContent + postTable;
  } else {
  }

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
  titleSlug = titleSlug;

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

var postProcessAssayPost = function(data, createTermObjs, assayPostResult) {
  return new Promise(function(resolve, reject) {
    app.models.WpTerms
      .kue({
        FormData: data.FormData,
        plateInfo: data.plateInfo,
        createTermObjs: createTermObjs
      }, assayPostResult)
      .then(function(kueResult) {
        return AssayImagePost
          .assayImagePost({
            FormData: data.FormData,
            plateInfo: data.plateInfo,
            createLibrarystockResult: data.createLibrarystockResult,
            imagePath: data.createExperimentAssayResult.platePath,
            postTitle: assayPostResult.postTitle,
            createTermObjs: createTermObjs,
            assayPostResult: assayPostResult,
          });
      })
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        console.warn('postProcessAssayPost ERROR ' + JSON.stringify(error));
        reject(new Error(error));
      });
  });
};

var assayProcessKue = function(data /*: Object */ , done /*: Function */ ) {
  // console.log('In AssayPost.assayProcessKue');

  var FormData = data.FormData;
  var plateInfo = data.plateInfo;
  var createLibrarystockResult = data.createLibrarystockResult;
  var createExperimentAssayResult = data.createExperimentAssayResult;

  var postArray = preProcessKue(data);
  var postObj = postArray[0];
  var dateNow = new Date().toISOString();

  var postObjWithDate = deepcopy(postObj);
  postObjWithDate.postDate = dateNow;
  postObjWithDate.postDateGmt = dateNow;
  // var postMeta = postArray[1];
  var createTermObjs = postArray[2];

  //TODO split this
  //TODO fix up variable naming
  //PlateInfo, platePath, imagePath, etc
  //TODO should make a general wpPosts post process
  app.models.WpPosts
    .findOrCreate({
      where: postObj
    }, postObjWithDate)
    .then(function(results) {
      var result = results[0];
      console.log('post process assaypost!');
      return postProcessAssayPost(data, createTermObjs, result);
    })
    .then(function() {
      done();
    })
    .catch(function(error) {
      console.log('AssayPost we got an error!' + JSON.stringify(error));
      done(new Error(error));
    });
};

module.exports = {
  assayProcessKue: assayProcessKue,
  genAssayPostMeta: genAssayPostMeta,
  preProcessKue: preProcessKue,
  postProcessAssayPost: postProcessAssayPost,
};
