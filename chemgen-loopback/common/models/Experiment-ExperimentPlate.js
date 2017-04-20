/* @flow */
'use strict';

module.exports = function(ExperimentExperimentplate /*: any */ ) {
  var Promise = require('bluebird');
  var app = require('../../server/server.js');
  // var queue = app.queue;
  var agenda = require('../../agenda/worker.js');

  ExperimentExperimentplate.processKue = function(queueObj, /*: Object */ done /*: Function */ ) {
    var FormData = queueObj.FormData;
    var createObj = queueObj.createObj;

    ExperimentExperimentplate
      .createExperimentPlate(createObj /*: Object */ )
      .then(function(result /*: Object */ ) {
        return submitToKue(FormData, result);
      })
      .then(function(results) {
        done();
      })
      .catch(function(error) {
        console.error('ExperimentExperimentplate.processKue' + error);
        console.error(error.stack);
        return done(new Error(error));
      });
  };

  /**
   * Create the experiment plate
   * Carry around an object that has vendorPlate data and ExperimentExperimentplate data
   * TODO create specific instances per library
   * @param  {Object} createObj [description]
   * @return {Promise<Token>}           [ExperimentExperimentplate Result]
   */
  ExperimentExperimentplate.createExperimentPlate = function(createObj) {

    return new Promise(function(resolve, reject) {
      ExperimentExperimentplate
        .findOrCreate({
          where: createObj,
        }, createObj)
        .then(function(result) {
          result = result[0];
          result.imagePath = createObj.imagePath;
          result.plateStartTime = createObj.plateStartTime;
          var retObj = {
            ExperimentExperimentplate: {
              barcode: result.barcode,
              experimentPlateId: result.experimentPlateId,
              imagePath: createObj.imagePath,
              plateStartTime: createObj.plateStartTime,
              instrumentId: result.instrumentId,
              instrumentPlateId: result.instrumentPlateId,
              screenId: result.screenId,
              screenStage: result.screenStage,
              temperature: result.temperature,
              title: createObj.title,
            },
            vendorPlate: {
              imagePath: createObj.imagePath,
              plateStartTime: createObj.plateStartTime,
              creationDate: createObj.plateCreationDate,
            },
            barcode: result.barcode,
            plateStartTime: createObj.plateStartTime,
            imagePath: createObj.imagePath,
            instrumentPlateId: result.instrumentPlateId,
            platebarcode: result.barcode,
            experimentPlateId: result.experimentPlateId,
            creationDate: createObj.plateCreationDate,
          };
          resolve(retObj);
        })
        .catch(function(error) {
          console.warn('ERROR ' + JSON.stringify(error));
          reject(new Error(error));
        });
    });
  };

  //This should be based on the library
  //TODO rework this - we need to also have these urls for the experimentPlatePost
  var submitToKue = function(FormData, /* FormData */ result /* Object */ ) {

    return new Promise(function(resolve, reject) {

      if (FormData.library === 'RNAi') {
        app.models.RnaiLibrarystock.createStockKue(FormData, result)
          .then(function(results) {
            return app.models.WpPosts.ExperimentPlatePost(FormData, result);
          })
          .then(function(results) {
            resolve(results);
          })
          .catch(function(error) {
            console.log('there was an error in here somewhere! ' + JSON.stringify(error));
            reject(new Error(error));
          });
      //TODO we need more posts!
      } else {
        app.models.ChemicalLibrarystock.kue(FormData, result);
        app.models.WpPosts.ExperimentPlatePost(FormData, result);
      }
    });
  };

  /**
   * kue
   * All Descripttors are for the chemical library plates - move to chemical library
   * @param  {[type]} input [description]
   * @return {[type]}       [description]
   */
  ExperimentExperimentplate.kue = function(input /*: Object */ ) {
    var FormData /*: FormData */ = input.FormData;
    var plateInfo /*: Object */ = input.plateInfo;

    // console.log('in ExpeirmentPlate.kue ' + JSON.stringify(plateInfo, null, 2));
    // console.log('');

    var title = [
      'ExperimentExperimentplate-',
      FormData.screenId,
      '-',
      FormData.instrumentId,
      '-',
      plateInfo.csPlateid,
      '-',
      plateInfo.barcode,
    ].join('');

    var createObj = {
      title: title,
      imagePath: plateInfo.imagePath,
      screenId: FormData.screenId,
      barcode: plateInfo.barcode,
      screenStage: FormData.screenStage,
      temperature: FormData.temperature,
      instrumentId: FormData.instrumentId,
      instrumentPlateId: plateInfo.csPlateid,
      plateStartTime: plateInfo.plateStartTime,
      plateCreationDate: plateInfo.creationDate,
    };

    var queueObj = {
      createObj: createObj,
      FormData: FormData,
    };

    return new Promise(function(resolve, reject) {
      agenda.now('createExperimentPlate', queueObj);
      resolve(queueObj);
    });
  };
};
