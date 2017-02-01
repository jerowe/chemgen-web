/* @flow */
'use strict';

module.exports = function(ExperimentExperimentplate /*: any */ ) {
  var Promise = require('bluebird');
  var app = require('../../server/server.js');
  var queue = app.queue;

  ExperimentExperimentplate.processKue = function(FormData, /*: FormData */ createObj, /*: Object */ done /*: Function */ ) {
    ExperimentExperimentplate
      .createExperimentPlate(createObj /*: Object */ )
      .then(function(result /*: Object */ ) {
        submitToKue(FormData, result);
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
   * @param  {Object} createObj [description]
   * @return {Promise<Token>}           [ExperimentExperimentplate Result]
   */
  ExperimentExperimentplate.createExperimentPlate = function(createObj) {
    return new Promise(function(resolve, reject) {
      ExperimentExperimentplate
        .create(createObj)
        .then(function(result /*: Object */ ) {
          // result.imagePath = createObj.imagePath;
          // result.plateStartTime = createObj.plateStartTime;
          var retObj = {
            ExperimentExperimentplate: {
              barcode: result.barcode,
              experimentPlateId: result.experimentPlateId,
              imagePath: result.imagePath,
              instrumentId: result.instrumentId,
              instrumentPlateId: result.instrumentPlateId,
              plateStartTime: result.plateStartTime,
              screenId: result.screenId,
              screenStage: result.screenStage,
              temperature: result.temperature,
              title: result.title,
            },
            vendorPlate: {
              imagePath: createObj.imagePath,
              plateStartTime: createObj.plateStartTime,
            },
          };
          resolve(retObj);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    });
  };

  //This should be based on the library
  //TODO rework this - we need to also have these urls for the experimentPlatePost
  var submitToKue = function(FormData, /* FormData */ result /* Object */ ) {
    app.models.ChemicalLibrarystock.kue(FormData, result);
    app.models.WpPosts.ExperimentPlatePost(FormData, result);
  };

  ExperimentExperimentplate.kue = function(input /*: Object */ ) {
    var FormData /*: FormData */ = input.FormData;
    var plateInfo /*: Object */ = input.plateInfo;

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
    };

    queue
      .create('createExperimentPlate', createObj)
      .events(false)
      .priority('high')
      .removeOnComplete(true)
      .ttl(60000)
      .delay(input.interval)
      .save();

    //TODO Update this to return a promise of our createObj
    return new Promise(function(resolve, reject) {
      queue.process('createExperimentPlate', function(job, /*: Object */ done /*: Function */ ) {
        ExperimentExperimentplate.processKue(FormData, job.data, done);
      });
      resolve(createObj);
    });
  // return;
  };
};
