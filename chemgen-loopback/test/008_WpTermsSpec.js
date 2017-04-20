'use strict';

var app = require('../server/server.js');
var helpers = require('./helpers');
var assayHelper = require('./helpers/005_ExperimentAssay.js');
var postHelper = require('./helpers/006_WpPost.js');
var assayPostHelper = require('./helpers/007_AssayPost');

var expect = require('chai').expect;
var assert = require('assert');
var Promise = require('bluebird');
var sinon = require('sinon');
// require('mock-kue');
var diff = require('deep-diff').diff;

var FormData = helpers.FormData;
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult;
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;
var createExperimentAssayResult = assayHelper.createExperimentAssayResult;
var plateInfo = helpers.plateInfo;

var assayPostResult = assayPostHelper.assayPostResult;
var wpTermKueSubmit = assayPostHelper.wpTermKueSubmit;
var wpTermKueSubmitResult = assayPostHelper.wpTermKueSubmitResult;

var wpTermsResult = [
  {
    "termId": 1,
    "name": "test",
    "slug": "test",
    "termGroup": 0
  }, {
    "termId": 2,
    "name": "M1M2M3M43DQ1",
    "slug": "M1M2M3M43DQ1",
    "termGroup": 0
  }, {
    "termId": 3,
    "name": "Primary",
    "slug": "Primary",
    "termGroup": 0
  }, {
    "termId": 4,
    "name": "22.5",
    "slug": "225",
    "termGroup": 0
  }, {
    "termId": 5,
    "name": "Junk",
    "slug": "Junk",
    "termGroup": 0
  }, {
    "termId": 6,
    "name": "N2",
    "slug": "N2",
    "termGroup": 0
  }, {
    "termId": 7,
    "name": "benzaldehyde [1-(4-biphenylyl)ethylidene]hydrazone",
    "slug": "benzaldehyde-1-4-biphenylylethylidenehydrazone",
    "termGroup": 0
  }
];

describe('008_WpTermsSpec: ', function() {
  it('WpTerms.preProcessKue', function(done) {
    app.models.WpTerms
      .preProcessKue(wpTermKueSubmitResult)
      .then(function(results) {
        done();
      }).catch(function(error) {
      done(new Error(error));
    })
  });

  it('WpTerms.find', function(done) {
    app.models.WpTerms.find().then(function(results) {
      expect(results[0].termId).to.deep.equal(wpTermsResult[0].termId);
      expect(results[1].termId).to.deep.equal(wpTermsResult[1].termId);
      expect(results[2].termId).to.deep.equal(wpTermsResult[2].termId);
      done();
    }).catch(function(error) {
      done(new Error(error));
    })
  });
});
