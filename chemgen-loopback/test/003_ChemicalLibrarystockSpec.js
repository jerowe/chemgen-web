'use strict';

var app = require('../server/server.js');
var helpers = require('./helpers');
var assayHelper = require('./helpers/005_ExperimentAssay.js');

var expect = require('chai').expect;
var assert = require('chai').assert;
var Promise = require('bluebird');
var sinon = require('sinon');
var _ = require('lodash');

// require('mock-kue');
// var kue = require('kue');
// var jobs = app.queue;

var ExperimentPlate = app.models.ExperimentExperimentplate;
var ChemicalChembridgelibrary = app.models.ChemicalChembridgelibrary;

var FormData = helpers.FormData;
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult;
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;

var chembridgeHelper = require('./helpers/004_ChemicalChemibridgeLibrary.js');
var stockHelper = require('./helpers/003_ChemicalLibrarystock.js');

var ChemicalChembridgelibraryDummy = chembridgeHelper.chembridgeDummy;
var chemicalKueData = stockHelper.chemicalKueData;
var ChemicalLibrarystockKueResults = stockHelper.kueResults;
var stockDummy = stockHelper.stockDummy;
var stockExpect = stockHelper.stockExpect;
var ExperimentAssayKue = assayHelper.kueExpect;

describe('004_ChemicalLibrarySpec: ', function() {
  it('should insert data into chembridge', function(done) {
    app.models.ChemicalChembridgelibrary
      .create(ChemicalChembridgelibraryDummy)
      .then(function(results) {
        done();
      })
      .catch(done);
  });
});

describe('004_ChemicalLibrarySpec Workflow: ', function() {
  //TODO add in a few more wells for the sake of testing
  beforeEach(function() {
    // kue.clear();
    // kue.drain();
    app.models.ChemicalLibrarystock.list96Wells = function() {
      return ['B10'];
    };
  });

  it('should return the queue obj', function(done) {
    app.models.ChemicalLibrarystock
      .kue(FormData, ExperimentExperimentplateResult)
      .then(function(results) {
        expect(results).to.deep.equal(ChemicalLibrarystockKueResults);
        done();
      })
      .catch(done);
  });

  it('Runs getLibraryInfo', function(done) {
    app.models.ChemicalLibrarystock
      .getLibraryInfo(ChemicalLibrarystockKueResults)
      .then(function(results) {
        expect(results).to.be.a('array');
        expect(results[0]).to.be.an('object');
        done();
      })
      .catch(done);
  });

  it('Creates ChemicalLibrarystock objects', function(done) {
    app.models.ChemicalLibrarystock
      .preProcessLibraryResults(chemicalKueData)
      .then(function(results) {
        expect(results[0].plateId).to.equal(1);
        expect(results[0].well).to.equal('B10');
        expect(results[0].parentstockId).to.equal(5102336);
        expect(results.length).to.equal(1);
        expect(results).to.deep.equal(stockDummy);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });

  /**
   * This test does nothing except make sure I understand lodash
   */
  it('Finds well in an array of librarys', function() {
    var libs = [ChemicalChembridgelibraryDummy];
    var lib = _.find(libs, {
      coordinate: 'B10',
    });
    expect(lib).to.deep.equal(ChemicalChembridgelibraryDummy);
  });

  it('Creates ChemicalLibrarystocks', function(done) {
    app.models.ChemicalLibrarystock
      .createChemicalLibraryStocks(stockDummy)
      .then(function(results) {
        expect(results[0].plateId).to.equal(stockExpect[0].plateId);
        expect(results[0].librarystockId)
          .to.equal(stockExpect[0].librarystockId);
        expect(results[0].parentstockId).to.equal(stockExpect[0].parentstockId);
        expect(results[0].well).to.equal(stockExpect[0].well);
        expect(results[0].taxTerm).to.equal(stockExpect[0].taxTerm);
        expect(results.length).to.equal(1);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });

  it('Passes chemical stocks off to the kue', function(done) {
    app.models.ChemicalLibrarystock
      .postProcess({
        FormData: FormData,
        plateInfo: t,
      }, stockExpect)
      .then(function(results) {
        expect(results).to.deep.equal(ExperimentAssayKue);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });

  it('Processes the entire chembridge workflow', function(done) {
    var callback = function(data) {
      if (data) {
        return 0;
      } else {
        return 1;
      }
    };

    app.models.ChemicalLibrarystock
      .processKue(ChemicalLibrarystockKueResults, callback)
      .then(function(results) {
        expect(results).to.equal(1);
        done();
      })
      .catch(done);
  });
});
