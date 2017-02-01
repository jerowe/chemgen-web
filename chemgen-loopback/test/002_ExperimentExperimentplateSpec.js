'use strict';

var app = require('../server/server.js');
var helpers = require('./helpers');
var kue = require('kue');
var jobs = app.queue;

var expect = require('chai').expect;
var assert = require('chai').assert;
var Promise = require('bluebird');
var sinon = require('sinon');
require('mock-kue');

var ExperimentPlate = app.models.ExperimentExperimentplate;

var FormData = helpers.FormData();
var submitKueResult = helpers.submitKueResult();
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult();

/**
 * Workflow for creating the ExperimentExperimentplate
 * This is where we actually start putting data in the database
 * Returns an object with ExperimentExperimentplate results and vendorPlate results
 */
describe('Testing ExperimentExperimentplate workflow', function() {
  it('Should return a ExperimentExperimentplate Result', function(done) {
    this.timeout(1000);
    app.models.ExperimentExperimentplate
      .createExperimentPlate(submitKueResult[0])
      .then(function(results) {
        expect(results).to.deep.equal(ExperimentExperimentplateResult);
        done();
      })
      .catch(done);
  });
});
