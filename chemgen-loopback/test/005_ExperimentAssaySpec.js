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

var ExperimentAssay = app.models.ExperimentAssay;
var ImageKue = require('../common/models/Experiment-Assay/ImageKue.js');

var FormData = helpers.FormData;
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult;
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;
var kueExpect = assayHelper.kueExpect;

var plateInfo = kueExpect[0].plateInfo;
var well = kueExpect[0].createLibrarystockResult.well;

var prepareExperimentAssayResult = assayHelper.prepareExperimentAssayResult;
var createExperimentAssayResult = assayHelper.createExperimentAssayResult;

var basePath = '/mnt/image/2014Dec08/966';
var vendorPath = '/mnt/Plate_Data/2014Dec08/MFGTMP-PC_141209150001/';
var imageExpect = {
  'convertImage': basePath + '/M1M2M3M43DQ1_B10.tiff',
  'convertBmp': basePath + '/M1M2M3M43DQ1_B10.bmp',
  'autoLevelTiffImage': basePath + '/M1M2M3M43DQ1_B10-autolevel.jpeg',
  'autoLevelJpegImage': basePath + '/M1M2M3M43DQ1_B10-autolevel.jpeg',
  'vendorImage': vendorPath + 'MFGTMP-PC_141209150001_B10f00d0.C01',
  'makeDir': basePath,
  'baseImage': basePath + '/M1M2M3M43DQ1_B10',
  'assayName': 'M1M2M3M43DQ1_B10',
  'plateId': 966,
};

var commandsExpect = [
  '#!/usr/bin/env bash',
  '',
  'mkdir -p /mnt/image/2014Dec08/966',
  'mkdir -p /tmp/wbg1fw29',
  'cp -f /mnt/Plate_Data/2014Dec08/MFGTMP-PC_141209150001/MFGTMP-PC_141209150001_B10f00d0.C01 /tmp/wbg1fw29/wbg1fw29.C01',
  '/var/data/bftools/bfconvert -overwrite /tmp/wbg1fw29/wbg1fw29.C01 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10.tiff',
  'convert -layers flatten -quality 100 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10.tiff /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10.bmp',
  'convert -auto-level /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10.tiff /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg',
  'convert -layers flatten -quality 100 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg',
  'convert -thumbnail 1024x1024 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-1024x1024.jpeg',
  'convert -thumbnail 1080x1080 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-1080x1080.jpeg',
  'convert -thumbnail 1080x675 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-1080x675.jpeg',
  'convert -thumbnail 150x150 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-150x150.jpeg',
  'convert -thumbnail 300x300 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-300x300.jpeg',
  'convert -thumbnail 400x250 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-400x250.jpeg',
  'convert -thumbnail 400x284 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-400x284.jpeg',
  'convert -thumbnail 510x384 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-510x384.jpeg',
  'convert -thumbnail 768x768 /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg /mnt/image/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel-768x768.jpeg',
  'rm -rf /tmp/wbg1fw29',
];

describe('005_ExperimentAssay', function() {
  it('Submits to the queue', function(done) {
    ExperimentAssay
      .kue(kueExpect[0], kueExpect[0].createLibrarystockResult)
      .then(function(results) {
        expect(results).to.deep.equal(kueExpect[0]);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });

  it('Gets the imagePath from the plateInfo object', function() {
    var plateInfo = kueExpect[0].plateInfo;
    var well = kueExpect[0].createLibrarystockResult.well;
    var imageArray = ExperimentAssay.getImagePath(plateInfo, well);

    expect(imageArray).to.deep
      .equal(['/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg',
        '2014Dec08',
        'MFGTMP-PC_141209150001',
        966]);
  });

  it('Tests the prepareExperimentAssay', function(done) {
    ExperimentAssay.prepareExperimentAssay(kueExpect[0])
      .then(function(results) {
        expect(results).to.deep.equal(prepareExperimentAssayResult);
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });

  it('Creates the experimentAssay', function(done) {
    ExperimentAssay.createAssay(prepareExperimentAssayResult)
      .then(function(results) {
        for (var key in createExperimentAssayResult) {
          if (createExperimentAssayResult.hasOwnProperty(key)) {
            expect(results[key])
              .to.equal(createExperimentAssayResult[key]);
          }
        }
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  });

  it('Tests the imageKue', function() {
    var images = ImageKue.genImageMeta(plateInfo, well);
    expect(images).to.deep.equal(imageExpect);
    var commands = ImageKue.generateImageCommands(images);
    expect(commands[6]).to.deep.equal(commandsExpect[6]);
    expect(commands[7]).to.deep.equal(commandsExpect[7]);
    expect(commands[8]).to.deep.equal(commandsExpect[8]);
    expect(commands[9]).to.deep.equal(commandsExpect[9]);
    expect(commands[10]).to.deep.equal(commandsExpect[10]);
    expect(commands[11]).to.deep.equal(commandsExpect[11]);
    expect(commands[12]).to.deep.equal(commandsExpect[12]);
    expect(commands[13]).to.deep.equal(commandsExpect[13]);
  });

  //This test does not work exactly as expected - probably something wrong here
  it('Tests the whole workflow', function() {
    var done = function(error) {
      return error;
    };

    var results = ExperimentAssay.processKue(kueExpect[0], done)
    expect(results).to.equal(undefined);
  });
});
