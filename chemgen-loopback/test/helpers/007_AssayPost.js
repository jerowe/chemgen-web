'use strict';

var helpers = require('../helpers.js');
var postHelper = require('./006_WpPost.js');
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult;
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;
var FormData = helpers.FormData;
var plateInfo = helpers.plateInfo;
var assayPostPreProcess = postHelper.assayPostPreProcess;

var assayPostResult = {
  "id": 1,
  "postAuthor": 1,
  "postDate": "2017-02-02T10:50:59.105Z",
  "postDateGmt": "2017-02-02T10:50:59.105Z",
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
};

var wpTermKueSubmit = {
  FormData: FormData,
  plateInfo: plateInfo,
  createTermObjs: assayPostPreProcess[2],
};

var wpTermKueSubmitResult = {
  title: "WpTerm-1M1M2M3M43DQ1-Post1",
  FormData: FormData,
  plateInfo: plateInfo,
  postId: assayPostResult.id,
  createPostResult: assayPostResult,
  createTerms: assayPostPreProcess[2],
};

module.exports = {
  wpTermKueSubmit: wpTermKueSubmit,
  wpTermKueSubmitResult: wpTermKueSubmitResult,
  assayPostResult: assayPostResult,
};
