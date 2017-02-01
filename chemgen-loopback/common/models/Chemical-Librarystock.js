/* @flow */
'use strict';

module.exports = function(ChemicalLibrarystock /*: any */ ) {
  var app = require('../../server/server.js');
  var queue = app.queue;

  var Promise = require('bluebird');
  var _ = require('lodash');
  var helpers = require('./helpers');
  // var winston = require('winston');
  // winston.level = 'debug';

  ChemicalLibrarystock.list96Wells = function() {
    var rows = helpers.rows();
    var cols = helpers.cols();
    var allVals = [];

    rows.map(function(row) {
      cols.map(function(col) {
        allVals.push(row + col);
      });
    });

    return allVals;
  };

  ChemicalLibrarystock.postProcess = function(data, chemicalLibraryStockResults) {
    return new Promise(function(resolve, reject) {
      Promise.map(chemicalLibraryStockResults, function(result) {
        return app.models.ExperimentAssay.kue(data, result);
      })
        .then(function(results) {
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        })
    });
  };

  ChemicalLibrarystock.createChemicalLibraryStocks = function(createObjs) {
    return new Promise(function(resolve, reject) {
      Promise.map(createObjs, function(createObj) {
        return ChemicalLibrarystock
          .create(createObj);
      })
        .then(function(results) {
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        })
      ;
    });
  };

  /**
   * Library is undef for empty wells
   * Add in a name and a taxTerm
   * @param  {Object | Undefined} libraryResult [Library record for that well]
   * @return {Object}               [Create a library result if it doesn't exist]
   */
  var checkLibraryResult = function(libraryResult) {
    if (!libraryResult) {
      libraryResult = {};
      libraryResult.name = 'chembridge_empty';
    }
    return libraryResult;
  };

  /**
   * Get a list of the 96 wells, iterate over our library results
   * Fill in any empty wells as library_empty
   * prepare out ChemicalLibrarystock.create object
   * @param  {Object} data [FormData, ExperimentPlate, vendorPlate, libraryResults]
   * @return {[type]}      [description]
   */
  ChemicalLibrarystock.preProcessLibraryResults = function(data) {
    var plateInfo = data.ExperimentExperimentplate;
    var libraryResults = data.libraryResults;
    var allWells = ChemicalLibrarystock.list96Wells();

    return new Promise(function(resolve, reject) {
      Promise.map(allWells, function(well) {
        var libraryResult = _.find(libraryResults, {
          coordinate: well
        });

        libraryResult = checkLibraryResult(libraryResult);

        var createStock = {
          plateId: plateInfo.experimentPlateId,
          parentstockId: libraryResult.chembridgelibraryId,
          well: well,
          taxTerm: libraryResult.name,
          metaLibrarystock: JSON.stringify({
            library: 'chembridge',
          }),
        };
        return createStock;
      })
        .then(function(results) {
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    });
  };

  /**
   * Get the appropriate plate from the vendor library
   * Array<ChemicalChembridgelibrary>
   * TODO update this for dynamic library variable
   * @param  {Object} data [FormData, ExperimentPlate, and vendorPlate]
   * @return {Array<ChemicalChembridgelibrary>}      []
   */
  ChemicalLibrarystock.getLibraryInfo = function(data) {
    var plateInfo = data.ExperimentExperimentplate;
    var plateObj = app.models.ChemicalChembridgelibrary
      .parseBarcode(plateInfo.barcode);

    return new Promise(function(resolve, reject) {
      app.models.ChemicalChembridgelibrary
        .findWells(plateObj.plateName)
        .then(function(libraryResults) {
          resolve(libraryResults);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    });
  };

  /**
   * This is the workflow of the ChemicalLibrarystock
   * 1. Preprocess the experimentPlateId to get the chemical plateInfo
   * 2. Iterate over the wells of the plate (96) to create the ChemicalLibrarystock
   * 3. Create chemical library stock
   * 4. Iterate over chemicalLibraryStock objs to populate ExperimentAssay Kue
   * @param  {Object}   data [FormData, plateInfo, vendorPlate]
   * @param  {Function} done [Callback to kue to signal we are finished]
   * @return {Value of done}        [done() or done(new Error(error))]
   */
  ChemicalLibrarystock.processKue = function(data, done) {
    return new Promise(function(resolve, reject) {
      ChemicalLibrarystock
        .getLibraryInfo(data)
        .then(function(libraryResults) {
          data.libraryResults = libraryResults;
          return ChemicalLibrarystock.preProcessLibraryResults(data);
        })
        .then(function(results) {
          return ChemicalLibrarystock.createChemicalLibraryStocks(results);
        })
        .then(function(results) {
          return ChemicalLibrarystock.postProcess(data, results);
        })
        .then(function(results) {
          // console.log('results are ' + JSON.stringify(results));
          resolve(done());
        })
        .catch(function(error) {
          reject(done(new Error(error)));
        });
    });
  };

  ChemicalLibrarystock.kue = function(FormData, plateInfo) {
    var title = [
      'ChemicalLibrarystock-',
      plateInfo.ExperimentExperimentplate.experimentPlateId,
      '-',
      plateInfo.ExperimentExperimentplate.barcode,
    ].join('');

    var queueObj = {
      title: title,
      FormData: FormData,
      ExperimentExperimentplate: plateInfo.ExperimentExperimentplate,
      vendorPlate: plateInfo.vendorPlate,
    };

    queue.watchStuckJobs(6000);
    queue
      .create('createChemicalLibrarystock', queueObj)
      .events(false)
      .priority('critical')
      .removeOnComplete('true')
      .ttl(60000)
      .save();

    queue
      .process('createChemicalLibrarystock', 1, function(job, done) {
        ChemicalLibrarystock
          .processKue(job.data, done);
      });

    return new Promise(function(resolve, reject) {
      resolve(queueObj);
    });
  };
};
