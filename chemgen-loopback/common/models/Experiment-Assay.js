'use strict';

/**
 * There are two separate workflows here
 * ImageQueue
 * The arrayscan keeps images in a proprietary formdata
 * We parse the imagePath from the arrayscanDB
 * And generate the appropriate commands to convert the image
 * When devstar is finished/trained we will add those commands as well
 * AssayKue
 * TBA
 * @param  {[type]} ExperimentAssay [description]
 * @return {[type]}                 [description]
 */
module.exports = function(ExperimentAssay) {
  var app = require('../../server/server.js');
  // var queue = app.queue;
  var Promise = require('bluebird');
  var fs = require('fs');
  var request = require('request');
  var imageKue = require('./Experiment-Assay/ImageKue.js');
  var agenda = app.agenda;

  ExperimentAssay.getImagePath = function(plateInfo, well) {
    var imageArray = plateInfo.imagePath.split('\\');
    var folder = imageArray[4];
    var imageId = imageArray[5];
    var plateId = plateInfo.instrumentPlateId;
    var assayName = plateInfo.barcode + '_' + well;

    var autoLevelJpegImage = ['/',
      folder, '/',
      plateId, '/',
      assayName,
      '-autolevel.jpeg'].join('');

    return [autoLevelJpegImage, folder, imageId, plateId];
  };

  /**
   * Actually create the assay
   * Takes input object from ExperimentAssay.prepareExperimentAssay
   * @param  {Object} ExperimentAssayObj [ExperimentAssayModel]
   * @return {[type]}                    [description]
   */
  ExperimentAssay.createAssay = function(ExperimentAssayObj) {

    return new Promise(function(resolve, reject) {
      ExperimentAssay
        .findOrCreate({
          where: ExperimentAssayObj
        }, ExperimentAssayObj)
        .then(function(results) {
          var result = results[0];
          resolve(result);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    });
  };

  /**
   * Create the ExperimentAssayObject
   * Hand results of the creation (Object + ID) to the next kue
   * Each libraryStock corresponds to a single well/assay
   * @param  {Object}   data [FormData, plateInfo, libraryStockResult]
   * @return {Object}        [Resolves ExperimentAssayResultSet]
   */
  ExperimentAssay.prepareExperimentAssay = function(data) {

    var FormData = data.FormData;
    var plateInfo = data.plateInfo;
    //This does not make sense!
    var LibrarystockResult = data.createLibrarystockResult;

    var well = LibrarystockResult.well;
    var image = ExperimentAssay.getImagePath(plateInfo, well);

    var ExperimentAssayObj = {
      plateId: plateInfo.experimentPlateId,
      assayName: plateInfo.barcode + '_' + well,
      well: well,
      biosampleId: 1,
      reagentId: LibrarystockResult.librarystockId,
      isJunk: FormData.junk,
      platePath: 'assays' + image[0],
      metaAssay: JSON.stringify({
        reagentType: FormData.reagentType,
        experimentType: 'organism',
        library: FormData.library,
      }),
      assayType: FormData.reagentType,
    };

    return new Promise(function(resolve, reject) {
      resolve(ExperimentAssayObj);
    });
  };

  ExperimentAssay.processKue = function(data, done) {
    ExperimentAssay
      .prepareExperimentAssay(data)
      .then(function(result) {
        return ExperimentAssay.createAssay(result);
      })
      .then(function(result) {
        return app.models.WpPosts
          .assayPostKue(data, result);
      })
      .then(function(result) {
        return done();
      })
      .catch(function(error) {
        return done(new Error(error));
      });
  };

  ExperimentAssay.kue = function(data, LibrarystockResult) {

    var FormData = data.FormData;
    var plateInfo = data.plateInfo;

    var title = [
      'ExperimentAssay-',
      plateInfo.experimentPlateId,
      '-',
      plateInfo.barcode,
      '-',
      LibrarystockResult.well,
    ].join('');

    var queueObj = {
      title: title,
      FormData: FormData,
      plateInfo: plateInfo,
      createLibrarystockResult: LibrarystockResult,
    };

    return new Promise(function(resolve, reject) {
      ExperimentAssay.imageKue(queueObj);
      ExperimentAssay.assayKue(queueObj);
      resolve(queueObj);
    });
  };

  /**
   * Create an assay object
   * The assay Kue is the main kue
   * The image kue is in ./ExperimentAssay/ImageKue.js
   * @param  {Object} queueObj [FormData, plateInfo, librarystockResult]
   */
  ExperimentAssay.assayKue = function(queueObj) {
    agenda.now('createExperimentAssay', queueObj);
  };

  /**
   * Start the imageKue
   * Parse the imagePath from the vendorPlate
   * Make a post to the server on 10. :3001
   * There is a queue on that server that does the actual image conversion
   * @param  {Object} queueObj [FormData, plateInfo, createLibrarystockResult]
   */
  ExperimentAssay.imageKue = function(queueObj) {
    return new Promise(function(resolve) {
      agenda.now('imageKue', queueObj);
      resolve();
    });
  };

};
