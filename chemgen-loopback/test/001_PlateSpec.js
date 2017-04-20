'use strict';

var app = require('../server/server.js');
var helpers = require('./helpers');
// var kue = require('kue');
// var jobs = app.queue;

var expect = require('chai').expect;
var assert = require('assert');
var Promise = require('bluebird');
var sinon = require('sinon');
require('mock-kue');

var Plate = app.models.Plate;
var ExperimentPlate = app.models.ExperimentExperimentplate;

//Get data from helpers
var FormData = helpers.FormData;
var plate = helpers.plate;
var plateList = helpers.plateList;
var populateExperimentPlateResult = helpers.populateExperimentPlateResult;
var submitKueResult = helpers.submitKueResult;

/**
 * This is the initial workflow:
 * A form is submitted from #/angular/experiment_input
 * Get a list of plateIds from the arrayscan in the form of plateStart, plateEnd
 * Take this list of plateStart-plateEnd, and get all plates between those two IDs
 * Carry over the barcode, the plateStartTime, and the imagePath to the ExperimentExperimentPlate model kue
 *
 * Tests for the ExperimentExperimentPlate creation are in ExperimentExperimentPlateSpec.js
 */
describe('001_PlateSpec', function() {
  beforeEach(function() {
    // kue.clear();
    // kue.drain();
  });

  afterEach(function() {
    // kue.clear();
    // kue.drain();
  });

  it('Should return a platelist', function(done) {
    this.timeout(1000);

    Plate.getList(plate)
      .then(function(results) {
        expect(results).to.deep.equal(plateList);
        done();
      })
      .catch(done);
  });

  it('Testing populate experiment plate', function(done) {
    this.timeout(1000);

    Plate.populateExperimentPlate(FormData, plateList)
      .then(function(results) {
        expect(results).to.deep.equal(populateExperimentPlateResult);
        done();
      })
      .catch(done);
  });

  it('Tests whole workflow', function(done) {
    this.timeout(1000);

    Plate.preProcessPlateList(FormData)
      .then(function(results) {
        expect(results).to.deep.equal(populateExperimentPlateResult);
        done();
      })
      .catch(done);
  });

  it('Tests submitting to the queue', function(done) {
    this.timeout(1000);

    populateExperimentPlateResult.map(function(result) {
      result.FormData = FormData;
    });

    Plate.submitKue(populateExperimentPlateResult)
      .then(function(results) {
        expect(results).to.deep.equal(submitKueResult);
        expect(kue.jobCount()).to.equal(2);
        done();
      })
      .catch(done);
  });

  it('Fails - Tests whole workflow', function(done) {
    this.timeout(1000);

    Plate.preProcessPlateList([])
      .then(function(results) {
        done(new Error('this test should have failed'));
      })
      .catch(function(error) {
        var em = 'expecting an array or an iterable' +
          ' object but got [object Null]';
        expect(error.message).to.equal(em);
        done();
      });
  });

  /**
   * Up to this point we should not have any experiment plates -
   * we are using the in memory database and mocking out the kue
   */
  it('Finds experiment Plates', function(done) {
    app.models.ExperimentExperimentplate
      .find()
      .then(function(results) {
        expect(results).to.deep.equal([]);
        done();
      })
      .catch(done);
  });
});
