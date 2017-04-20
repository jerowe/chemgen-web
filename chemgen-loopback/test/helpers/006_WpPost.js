'use strict';

var helpers = require('../helpers.js');
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult;
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;
var FormData = helpers.FormData;

//Post 1 is the initial Assay Post
//Post 2 is the Image post associated to the assay Post
var posts = [{
  "id": 1,
  "postAuthor": 1,
  "postDate": "2017-02-01T10:09:57.154Z",
  "postDateGmt": "2017-02-01T10:09:57.154Z",
  "postContent": "<h3>Screen Information</h3><br><b>Plate View: </b><a href=\"http://onyx.abudhabi.nyu.edu/wordpress/plate/1-M1M2M3M43DQ1/\">M1M2M3M43DQ1</a><br><b>Screen Name: </b>test<br><b>Screen Temperature: </b>22.5<br><b>Library: </b>Chembridge<br><b>Screen Stage: </b>1<br><b>Imaging Date: </b>Tue Dec 09 2014 19:53:19 GMT+0400 (GST)<br><b>Junk: </b>Junk<br><h2>Tags</h2><b>Term: </b><a href=\"http://onyx.abudhabi.nyu.edu/wordpress/chembridge/benzaldehyde-1-4-biphenylylethylidenehydrazone/\">benzaldehyde [1-(4-biphenylyl)ethylidene]hydrazone</a><br>",
  "postTitle": "1-m1m2m3m43dq1_b10",
  "postStatus": "publish",
  "commentStatus": "open",
  "pingStatus": "open",
  "postName": "1-m1m2m3m43dq1_b10",
  "postParent": 0,
  "guid": "http://onyx.abudhabi.nyu.edu/wordpress/1-m1m2m3m43dq1_b10",
  "menuOrder": 0,
  "postType": "assay",
  "commentCount": 0
}, {
  "id": 2,
  "postAuthor": 1,
  "postDate": "2017-02-01T10:09:57.166Z",
  "postDateGmt": "2017-02-01T10:09:57.166Z",
  "postContent": "",
  "postTitle": "1-m1m2m3m43dq1_b10.jpeg",
  "postStatus": "inherit",
  "commentStatus": "open",
  "pingStatus": "closed",
  "postName": "1-m1m2m3m43dq1_b10",
  "postParent": 0,
  "guid": "http://onyx.abudhabi.nyu.edu/wordpress/wp-content/uploads/assays/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg",
  "menuOrder": 0,
  "postType": "attachment",
  "postMimeType": "image/jpeg",
  "commentCount": 0
}];

//This should be a valid date string - but it will always be 'now'
// "postDate": "2017-01-30T10:09:43.457Z",
// "postDateGmt": "2017-01-30T10:09:43.457Z",
var assayPostPreProcess = [{
  "postAuthor": 1,
  "postType": "assay",
  "commentCount": 0,
  "menuOrder": 0,
  "postContent": "<h3>Screen Information</h3><br><b>Plate View: </b><a href=\"http://onyx.abudhabi.nyu.edu/wordpress/plate/1-M1M2M3M43DQ1/\">M1M2M3M43DQ1</a><br><b>Screen Name: </b>test<br><b>Screen Temperature: </b>22.5<br><b>Library: </b>Chembridge<br><b>Screen Stage: </b>1<br><b>Imaging Date: </b>Tue Dec 09 2014 19:53:19 GMT+0400 (GST)<br><b>Junk: </b>Junk<br><h2>Tags</h2><b>Term: </b><a href=\"http://onyx.abudhabi.nyu.edu/wordpress/chembridge/benzaldehyde-1-4-biphenylylethylidenehydrazone/\">benzaldehyde [1-(4-biphenylyl)ethylidene]hydrazone</a><br>",
  "postStatus": "publish",
  "postTitle": "1-m1m2m3m43dq1_b10",
  "postName": "1-m1m2m3m43dq1_b10",
  "postParent": 0,
  "pingStatus": "open",
  "commentStatus": "open",
  "guid": "http://onyx.abudhabi.nyu.edu/wordpress/1-m1m2m3m43dq1_b10"
}, {
  "postContent": "<h3>Screen Information</h3><br><b>Plate View: </b><a href=\"http://onyx.abudhabi.nyu.edu/wordpress/plate/1-M1M2M3M43DQ1/\">M1M2M3M43DQ1</a><br><b>Screen Name: </b>test<br><b>Screen Temperature: </b>22.5<br><b>Library: </b>Chembridge<br><b>Screen Stage: </b>1<br><b>Imaging Date: </b>Tue Dec 09 2014 19:53:19 GMT+0400 (GST)<br><b>Junk: </b>Junk<br><h2>Tags</h2><b>Term: </b><a href=\"http://onyx.abudhabi.nyu.edu/wordpress/chembridge/benzaldehyde-1-4-biphenylylethylidenehydrazone/\">benzaldehyde [1-(4-biphenylyl)ethylidene]hydrazone</a><br>",
  "wpUrl": "http://onyx.abudhabi.nyu.edu/wordpress",
  "wpUI": 1
}, [{
  "taxonomy": "screen",
  "taxTerm": "test"
}, {
  "taxonomy": "barcode",
  "taxTerm": "M1M2M3M43DQ1"
}, {
  "taxonomy": "screen_stage",
  "taxTerm": "Primary"
}, {
  "taxonomy": "temperature",
  "taxTerm": 22.5
}, {
  "taxonomy": "junk",
  "taxTerm": "Junk"
}, {
  "taxonomy": "worm_strain",
  "taxTerm": "N2"
}, {
  "taxonomy": "chembridge",
  "taxTerm": "benzaldehyde [1-(4-biphenylyl)ethylidene]hydrazone"
}]];

var wpKueExpect = {
  'title': 'ExperimentAssayPost-1-M1M2M3M43DQ1-B10',
  'FormData': FormData,
  'plateInfo': t,
  'createLibrarystockResult': {
    'librarystockId': 1,
    'parentstockId': 5102336,
    'plateId': 1,
    'well': 'B10',
    'taxTerm': 'benzaldehyde [1-(4-biphenylyl)ethylidene]hydrazone',
    'metaLibrarystock': JSON.stringify({
      library: 'chembridge'
    })
  },
  'createExperimentAssayResult': {
    'assayId': 1,
    'plateId': 1,
    'assayName': 'M1M2M3M43DQ1_B10',
    'well': 'B10',
    'biosampleId': 1,
    'reagentId': 1,
    'isJunk': 1,
    'platePath': 'assays/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg',
    'metaAssay': JSON.stringify({
      reagentType: 'chemical',
      'experimentType': 'organism',
      library: 'chembridge'
    }),
    'assayType': 'chemical'
  }
};

module.exports = {
  posts: posts,
  assayPostPreProcess: assayPostPreProcess,
  wpKueExpect: wpKueExpect,
};
