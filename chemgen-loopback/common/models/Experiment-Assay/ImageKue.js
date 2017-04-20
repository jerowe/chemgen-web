'use strict';

var app = require('../../../server/server.js');
// var queue = app.queue;
var Promise = require('bluebird');
var fs = require('fs');
var request = require('request');

var ExperimentAssay = app.models.ExperimentAssay;

var generateImageCommands = function(images) {
  var convertImage = images.convertImage;
  var convertBmp = images.convertBmp;
  var autoLevelTiffImage = images.autoLevelTiffImage;
  var autoLevelJpegImage = images.autoLevelJpegImage;
  var makeDir = images.makeDir;
  var vendorImage = images.vendorImage;
  var baseImage = images.baseImage;

  var random = Math.random().toString(36).substring(7);
  var tmpImage = '/tmp/' + random + '/' + random + '.C01';

  //convert -thumbnail 1024x1024 plate1_H11.jpeg plate1_H11-autolevel-1024x1024.jpeg
  var thumbSizes = [
    '1024x1024',
    '1080x1080',
    '1080x675',
    '150x150',
    '300x300',
    '400x250',
    '400x284',
    '510x384',
    '768x768',
  ];

  var commands = [];
  commands.push('#!/usr/bin/env bash');
  commands.push('');

  commands.push('mkdir -p ' + makeDir);
  commands.push('mkdir -p /tmp/' + random);
  commands.push('cp -f ' + vendorImage + ' ' + tmpImage);
  commands.push([
    '/var/data/bftools/bfconvert -overwrite ',
    tmpImage, ' ',
    convertImage].join(''));
  commands.push(['convert -layers flatten ',
    '-quality 100 ',
    convertImage,
    ' ', convertBmp].join(''));
  commands.push(['convert -auto-level ',
    convertImage,
    ' ',
    autoLevelTiffImage].join(''));
  commands.push(['convert -layers flatten ',
    '-quality 100 ',
    autoLevelTiffImage,
    ' ',
    autoLevelJpegImage].join(''));

  thumbSizes.map(function(thumbSize) {
    commands.push(['convert -thumbnail ',
      thumbSize,
      ' ',
      autoLevelJpegImage,
      ' ',
      baseImage,
      '-autolevel-',
      thumbSize,
      '.jpeg'].join(''));
  });
  commands.push('rm -rf ' + '/tmp/' + random);

  return commands;
};

// SOMETHING IS WRONG
//
var genImageMeta = function(plateInfo, well) {

  var imageArray = plateInfo.imagePath.split('\\');
  var folder = imageArray[4];
  var imageId = imageArray[5];
  var plateId = plateInfo.instrumentPlateId;
  var assayName = plateInfo.barcode + '_' + well;
  // var assayName = plateInfo.platebarcode + '_' + well;

  var imagePath = [
    '/mnt/Plate_Data/',
    folder, '/',
    imageId, '/',
    imageId].join('');
  var ext = 'f00d0.C01';
  var vendorImage = imagePath + '_' + well + ext;
  var outDir = '/mnt/image/';
  var makeDir = outDir + folder + '/' + plateId;
  var baseImage = makeDir + '/' + assayName;
  var autoLevelJpegImage = baseImage + '-autolevel.jpeg';

  var images = {
    convertImage: baseImage + '.tiff',
    convertBmp: baseImage + '.bmp',
    autoLevelTiffImage: autoLevelJpegImage,
    autoLevelJpegImage: baseImage + '-autolevel.jpeg',
    vendorImage: vendorImage,
    makeDir: makeDir,
    baseImage: baseImage,
    assayName: assayName,
    plateId: plateId,
  };

  return images;
};

//TODO set up express endpoint for this
/**
 * Parse the imagePath and the imageId from the plateInfo object
 * Get the commands
 * Post them to the server on the centos blade to process
 * TODO - add in a force parameter
 * TODO - separate this out for testing
 * @param  {Object} plateInfo [PlateInfo - imagePath, imstrumentPlateId, barcode]
 * @param  {String} well      [A01 - H12]
 * @return {[type]}           [description]
 */
var convertImages = function(plateInfo, well) {


  return new Promise(function(resolve, reject) {

    //TODO merge this with getImagePath function
    var plateId = plateInfo.instrumentPlateId;
    var assayName = plateInfo.barcode + '_' + well;

    // console.log('converting images!' + JSON.stringify(plateInfo));
    var images = genImageMeta(plateInfo, well);
    var autoLevelJpegImage = images.autoLevelJpegImage;

    // console.log('image is ' + JSON.stringify(autoLevelJpegImage));

    fs.access(autoLevelJpegImage, function(err) {
      if (err && err.code === 'ENOENT') {
        var commands = generateImageCommands(images);
        var imageJob = {
          title: 'convertImage-' + plateId + '-' + assayName,
          commands: commands,
          plateId: plateId,
        };
        images.convert = 1;

        request.post('http://10.230.9.204:3001/', {
          json: imageJob,
        }, function(error) {
          //We should check for status codes here, but they are not very reliable
          //TODO make status codes reliable
          resolve(images);
        });
      } else {
        images.convert = 0;
        resolve(images);
      }
    });
  });
};

var processImageKue = function(data, done) {
  convertImages(data.plateInfo, data.createLibrarystockResult.well)
    .then(function() {
      done();
    })
    .catch(function(error) {
      return done(new Error(error));
    });
};

module.exports = {
  processImageKue: processImageKue,
  generateImageCommands: generateImageCommands,
  convertImages: convertImages,
  genImageMeta: genImageMeta,
};
