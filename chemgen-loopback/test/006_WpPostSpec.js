'use strict';

var app = require('../server/server.js');
var helpers = require('./helpers');
// var kue = require('kue');
// var jobs = app.queue;

var app = require('../server/server.js');
var helpers = require('./helpers');
var assayHelper = require('./helpers/005_ExperimentAssay.js');
var postHelper = require('./helpers/006_WpPost.js');

var WpPosts = app.models.WpPosts;
var AssayPost = require('../common/models/Wp-Posts/AssayPost.js');

var expect = require('chai').expect;
var assert = require('assert');
var Promise = require('bluebird');
var sinon = require('sinon');
// require('mock-kue');

var FormData = helpers.FormData;
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult;
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;
var kueExpect = assayHelper.kueExpect;
var createExperimentAssayResult = assayHelper.createExperimentAssayResult;

var assayPostPreProcess = postHelper.assayPostPreProcess;
var posts = postHelper.posts;
var wpKueExpect = postHelper.wpKueExpect;

describe('006_WpPost', function() {
  it('tests the kue', function(done) {
    WpPosts
      .assayPostKue(kueExpect[0], createExperimentAssayResult)
      .then(function(results) {
        expect(results).to.deep.equal(wpKueExpect);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      })
  });

  it('preprocesses', function() {
    var results = AssayPost.preProcessKue(wpKueExpect);
    expect(results[0].postContent).to.equal(assayPostPreProcess[0].postContent);
    expect(results[1]).to.deep.equal(assayPostPreProcess[1]);
  });

  it('runs whole AssayPost workflow', function() {
    var done = function(error) {
      console.log('done!');
      expect(error).to.equal(undefined);
    };
    AssayPost.assayProcessKue(wpKueExpect, done);
  });

  it('finds some posts', function(done) {
    WpPosts
      .find()
      .then(function(results) {
        expect(results[0].id).to.deep.equal(posts[0].id);
        expect(results[0].postContent).to.deep.equal(posts[0].postContent);
        expect(results[0].postTitle).to.deep.equal(posts[0].postTitle);
        expect(results[0].postStatus).to.deep.equal(posts[0].postStatus);
        expect(results[0].postType).to.deep.equal(posts[0].postType);
        expect(results[1].id).to.deep.equal(posts[1].id);
        expect(results[1].postContent).to.deep.equal(posts[1].postContent);
        expect(results[1].postTitle).to.deep.equal(posts[1].postTitle);
        expect(results[1].postStatus).to.deep.equal(posts[1].postStatus);
        expect(results[1].postType).to.deep.equal(posts[1].postType);
        expect(results.length).to.equal(2);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });

});
