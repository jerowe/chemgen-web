'use strict';

module.exports = function(RnaiLibrarystock) {
  var Promise = require('bluebird');
  var app = require('../../server/server.js');
  var agenda = require('../../agenda/worker.js');
  var _ = require('lodash');
  var helpers = require('./helpers.js');
  var slug = require('slug');

  RnaiLibrarystock.postProcessStockKue = function(queueObj, libraryResults) {
    return new Promise(function(resolve, reject) {
      Promise.map(libraryResults, function(libraryResult) {
        return app.models.ExperimentAssay.kue(queueObj, libraryResult);
      });
    });
  }

  RnaiLibrarystock.createStockKue = function(FormData, plateInfo) {

    return new Promise(function(resolve, reject) {

      var queueObj = {
        FormData: FormData,
        plateInfo: plateInfo,
        ExperimentExperimentplate: plateInfo.ExperimentExperimentplate,
        vendorPlate: plateInfo.vendorPlate,
      };


      agenda.now('RnaiCreateStockKue', queueObj);
      resolve(queueObj);
    });
  };

  RnaiLibrarystock.processCreateStock = function(queueObj, done) {
    var FormData = queueObj.FormData;
    var plateInfo = queueObj.plateInfo;
    var barcode = plateInfo.ExperimentExperimentplate.barcode;

    RnaiLibrarystock.getParentLibrary(FormData, barcode)
      .then(function(results) {
        return RnaiLibrarystock.preProcessLibraryResults({
          ExperimentExperimentplate: plateInfo,
          libraryResults: results,
          FormData: FormData,
        });
      })
      .then(function(results) {
        return RnaiLibrarystock.createRnaiLibraryStocks(results);
      })
      .then(function(results) {
        return RnaiLibrarystock.postProcessStockKue(queueObj, results);
      })
      .then(function(results) {
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });

  };

  RnaiLibrarystock.getParentLibrary = function(FormData, barcode) {
    //Check
    return new Promise(function(resolve, reject) {
      RnaiLibrarystock.getLibraryInfo(FormData, barcode)
        .then(function(results) {
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
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
      libraryResult.name = 'ahringer_empty';
      libraryResult.geneName = 'ahringer_empty';
    }
    return libraryResult;
  };

  //TODO This is basically the same as the createChemicalLibraryStocks
  RnaiLibrarystock.createRnaiLibraryStocks = function(createObjs) {
    return new Promise(function(resolve, reject) {
      Promise.map(createObjs, function(createObj) {
        return RnaiLibrarystock
          .findOrCreate({
            where: createObj
          }, createObj)
          .then(function(results) {
            var result = results[0];
            result.taxTerms = createObj.taxTerms;
            result.geneName = createObj.geneName;
            return result;
          })
      })
        .then(function(results) {
          // var result = results[0];
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        })
      ;
    });
  };

  RnaiLibrarystock.preProcessLibraryResults = function(data) {
    // rnailibraryId

    return new Promise(function(resolve, reject) {
      if (!data) {
        reject(new Error());
      }
      var plateInfo = data.ExperimentExperimentplate;
      var libraryResults = data.libraryResults;
      var FormData = data.FormData;

      var allWells = helpers.list96Wells();
      // allWells = ['A01', 'A02'];
      Promise.map(allWells, function(well) {

        //TODO FIX THIS
        var libraryResult = {};
        if (plateInfo.ExperimentExperimentplate.barcode.match('L4440')) {
          libraryResult.name = 'L4440';
          libraryResult.geneName = 'L4440';
        } else {

          libraryResult = _.find(libraryResults, {
            well: well
          });
        }

        libraryResult = checkLibraryResult(libraryResult);
        var condition = RnaiLibrarystock.parseCond(plateInfo.ExperimentExperimentplate.barcode);

        var createStock = {
          plateId: plateInfo.ExperimentExperimentplate.experimentPlateId,
          parentstockId: libraryResult.rnailibraryId,
          librarystockName: plateInfo.ExperimentExperimentplate.barcode,
          well: well,
          taxTerms: [{
            taxonomy: 'wb_sequence_id',
            taxTerm: libraryResult.geneName
          }, {
            taxonomy: 'condition',
            taxTerm: condition,
          }, {
            taxonomy: 'envira-tag',
            taxTerm: condition + '-' + libraryResult.geneName,
          }, {
            taxonomy: 'envira-tag',
            taxTerm: FormData.screenName + '_' + condition + '_' + libraryResult.geneName,
          },
          ],
          taxTerm: libraryResult.name,
          geneName: libraryResult.geneName,
          metaLibrarystock: JSON.stringify({
            library: 'ahringer',
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

  RnaiLibrarystock.getLibraryInfo = function(FormData, barcode) {

    var quadrant = RnaiLibrarystock.getQuad(barcode);
    var plate = RnaiLibrarystock.getPlate(FormData.RnaiPlateNo);
    var chrom = FormData.chrom;

    return new Promise(function(resolve, reject) {

      app.models.RnaiRnailibrary
        .find({
          where: {
            stockTitle: chrom + '-' + plate + '--' + quadrant,
            chrom: chrom,
            plate: plate,
          }
        })
        .then(function(results) {
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    });

  };

  RnaiLibrarystock.getPlate = function(plateNo) {
    var matches = ['A1', 'B1', 'A2', 'B2', 'Q1', 'Q2', 'Q3', 'Q4'];
    var plate;
    matches.map(function(match) {
      plate = plateNo.replace(match, '');
    });
    return plate;
  }

  /**
   * Get condition from barcode
   * @param  {[type]} barcode [Barcode from the arrayscan - RNAiI.1A1_E_D]
   * @return {[type]}         [Enhancer/Suppressor]
   */
  RnaiLibrarystock.parseCond = function(barcode) {

    if (barcode.match('E')) {
      return 'Enhancer';
    } else if (barcode.match('S')) {
      return 'Suppressor';
    } else {
      return 0;
    }
  };

  /**
   * See if its a duplicate
   * @param  {[type]} barcode [Barcode from the arrayscan - RNAiI.1A1_E_D]
   * @return {[type]}         [True/False]
   */
  RnaiLibrarystock.isDuplicate = function(barcode) {

    if (barcode.match('D')) {
      return 1;
    } else {
      return 0;
    }
  };

  RnaiLibrarystock.getTemp = function(barcode, FormData) {

    var cond = RnaiLibrarystock.parseCond(barcode);
    var temp = 0;
    if (cond === 'Enhancer') {
      return FormData.EnhancerTemp || 0;
    } else if (cond === 'Suppress') {
      return FormData.SuppressorTemp || 0;
    } else {
      return 0;
    }
    return temp;
  };

  /**
   * Get the quadrant
   * If it matches Q{1-4} - translate to {A,B}{1,2}
   * @param  {object} barcode [Barcode from the arrayscan - RNAiI.1A1_E_D]
   * @return {string}         [{A,B},{1,2}]
   */
  RnaiLibrarystock.getQuad = function(barcode) {
    var codes = {
      Q1: 'A1',
      Q2: 'A2',
      Q3: 'B1',
      Q4: 'B2',
    };

    var plateQuadrant;
    for (var key in codes) {
      if (barcode.match(key)) {
        plateQuadrant = codes[key];
      } else if (barcode.match(codes[key])) {
        plateQuadrant = codes[key];
      }
    }
    if (plateQuadrant) {
      return plateQuadrant;
    } else {
      return 0;
    }
  };

  /**
   * Create the ExperimentExperimentPlate
   * TODO merge this function with createExperimentPlate
   * @param  {[type]} plate [description]
   * @return {[type]}       [description]
   */
  RnaiLibrarystock.processVendorPlate = function(FormData, plate) {

    return new Promise(function(resolve, reject) {

      var temp = RnaiLibrarystock.getTemp(plate.platebarcode, FormData);

      plate.barcode = plate.platebarcode;
      plate.plateStartTime = plate.platestarttime;
      plate.imagePath = plate.imagepath;
      plate.creationDate = plate.creationdate;
      FormData.temperature = temp;

      return app.models.ExperimentExperimentplate.kue({
        FormData: FormData,
        plateInfo: plate
      });

    })
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  };

  RnaiLibrarystock.processVendorPlates = function(data, done) {
    var FormData = data.FormData;
    var plates = data.plates;

    Promise.map(plates, function(plate) {
      return RnaiLibrarystock.processVendorPlate(FormData, plate);
    })
      .then(function(results) {
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  };


  /**
   * Process the vendorPlates up to the ExperimentPlate
   * @param  {Object} FormData [description]
   * @param  {Object} plates   [description]
   * @return {Promise}          [description]
   */

  RnaiLibrarystock.kue = function(FormData, plates) {

    var queueObj = {
      FormData: FormData,
      plates: plates
    };

    return new Promise(function(resolve, reject) {
      agenda.now('RnaiLibrarystockProcessVendorPlates', queueObj);
      resolve(queueObj);
    });
  };

};
