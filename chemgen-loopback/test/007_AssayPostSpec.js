'use strict';

var app = require('../server/server.js');
var helpers = require('./helpers');
// var kue = require('kue');
// var jobs = app.queue;
// require('mock-kue');

var app = require('../server/server.js');
var helpers = require('./helpers');
var assayHelper = require('./helpers/005_ExperimentAssay.js');
var postHelper = require('./helpers/006_WpPost.js');
var assayPostHelper = require('./helpers/007_AssayPost');

var expect = require('chai').expect;
var assert = require('assert');
var Promise = require('bluebird');
var sinon = require('sinon');
var diff = require('deep-diff').diff;

var FormData = helpers.FormData;
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult;
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;
var createExperimentAssayResult = assayHelper.createExperimentAssayResult;
var plateInfo = helpers.plateInfo;

var WpPosts = app.models.WpPosts;
var AssayPost = require('../common/models/Wp-Posts/AssayPost.js');

var wpKueExpect = postHelper.wpKueExpect;
var assayPostPreProcess = postHelper.assayPostPreProcess;

var assayPostResult = assayPostHelper.assayPostResult;
var wpTermKueSubmit = assayPostHelper.wpTermKueSubmit;
var wpTermKueSubmitResult = assayPostHelper.wpTermKueSubmitResult;

describe('007_AssayPost', function() {
  it('AssayPost.preProcessKue', function() {
    var postData = AssayPost.preProcessKue(wpKueExpect);
    expect(postData[0].postType).to.equal('assay');
    expect(postData[1]).to.deep.equal(assayPostPreProcess[1]);
    expect(postData[2]).to.deep.equal(assayPostPreProcess[2]);
  });

  it('AssayPost.postProcessAssayPost', function(done) {
    AssayPost
      .postProcessAssayPost(wpKueExpect, assayPostPreProcess[2], assayPostResult)
      .then(function(results) {
        expect(results).to.equal(undefined);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });

  it('WpTerms.kue', function(done) {
    app.models.WpTerms
      .kue(wpTermKueSubmit, assayPostResult)
      .then(function(results) {
        expect(results.FormData).to.deep.equal(wpTermKueSubmitResult.FormData);
        expect(results.postId).to.equal(wpTermKueSubmitResult.postId);
        expect(results.title).to.equal(wpTermKueSubmitResult.title);
        expect(results.plateInfo).to.deep.equal(wpTermKueSubmitResult.plateInfo);
        expect(results.createTermObjs).to.deep.equal(wpTermKueSubmitResult.createTermObjs);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });
});
