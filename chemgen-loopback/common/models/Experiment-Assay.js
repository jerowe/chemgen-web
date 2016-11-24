module.exports = function(ExperimentAssay) {

    var kue = require('kue');
    var queue = kue.createQueue();
    var app = require('../../server/server.js');
    var Promise = require('bluebird');
    var fs = require('fs');
    var request = require('request');

    function getImagePath(plateInfo, well) {

        var imageArray = plateInfo.imagePath.split('\\');
        var folder = imageArray[4];
        var imageId = imageArray[5];
        var plateId = plateInfo.instrumentPlateId;
        var assayName = plateInfo.barcode + "_" + well;

        var autoLevelJpegImage = '/' + folder + '/'  + plateId + '/'  + assayName + '-autolevel.jpeg';

        return [autoLevelJpegImage, folder, imageId, plateId];
    }

    function convertImages(plateInfo, well) {

        return new Promise(function(resolve) {

            var imageArray = plateInfo.imagePath.split('\\');
            var folder = imageArray[4];
            var imageId = imageArray[5];
            var plateId = plateInfo.instrumentPlateId;
            var assayName = plateInfo.barcode + "_" + well;

            var imagePath = '/mnt/Plate_Data/' + folder + '/' + imageId + '/' + imageId;
            var ext = "f00d0.C01";

            var vendorImage = imagePath + '_' + well + ext;

            var outDir = '/mnt/image/';
            var makeDir = outDir + folder + '/' + plateId;

            var baseImage = makeDir + '/' + assayName;

            var convertImage = baseImage + '.tiff';
            var convertBmp = baseImage + '.bmp';
            var autoLevelTiffImage = baseImage + '-autolevel.tiff';
            var autoLevelJpegImage = baseImage + '-autolevel.jpeg';

            //convert -thumbnail 1024x1024 MFGTMP-PC_141209150001_H11.jpeg MFGTMP-PC_141209150001_H11-autolevel-1024x1024.jpeg
            var thumbSizes = ['1024x1024', '1080x1080', '1080x675', '150x150', '300x300', '400x250', '400x284', '510x384', '768x768'];

            var commands = [];

            fs.access(autoLevelJpegImage, function(err) {

                if (err && err.code === 'ENOENT') {
                    //console.log('we are creating some images!');
                    commands.push('#!/usr/bin/env bash');
                    commands.push('');

                    commands.push('mkdir -p ' + makeDir);

                    var random = Math.random().toString(36).substring(7);
                    var tmpImage = '/tmp/' + random + '/' + random + '.C01';

                    commands.push('mkdir -p /tmp/' + random);
                    commands.push('cp -f ' + vendorImage + ' ' + tmpImage);
                    commands.push('/var/data/bftools/bfconvert -overwrite ' + tmpImage + ' ' + convertImage);
                    commands.push('convert -layers flatten -quality 100 ' + convertImage + ' ' + convertBmp);
                    commands.push('convert -auto-level ' + convertImage + ' ' + autoLevelTiffImage);
                    commands.push('convert -layers flatten -quality 100 ' + autoLevelTiffImage + ' ' + autoLevelJpegImage);

                    thumbSizes.map(function(thumbSize) {
                        commands.push('convert -thumbnail ' + thumbSize + ' ' + autoLevelJpegImage + ' ' + baseImage + '-autolevel-' + thumbSize + '.jpeg');
                    });
                    commands.push('rm -rf ' + '/tmp/' + random);
                    //commands.push('rm -rf ' + autoLevelTiffImage);

                    var imageJob = {
                        title: 'convertImage-' + plateId + '-' + assayName,
                        commands: commands,
                    };

                    request.post(
                        'http://10.230.9.204:3001/', {
                            json: imageJob
                        },
                        function() {

                            resolve();
                            ////if (!error && response.statusCode === 200) {
                            //////everything is gooe
                            ////} else {
                            //////console.log('there was an error submitting jobs');
                            ////}
                        }
                    );

                } else {
                    //console.log('we are not creating some images...');
                    resolve();
                }

            });

        });
    }

    ExperimentAssay.processImageKue = function(data, done) {

        convertImages(data.plateInfo, data.createLibrarystockResult.well)
            .then(function() {
                done();
            })
            .catch(function(error) {
                console.log('there was an error! ' + error);
                return done(new Error(error));
            });
    };

    ExperimentAssay.processKue = function(data, done) {

        var FormData = data.FormData;
        var plateInfo = data.plateInfo;
        var createLibrarystockResult = data.createLibrarystockResult;

        var image = getImagePath(plateInfo, createLibrarystockResult.well);

        var createExperimentAssayObj = {

            plateId: plateInfo.experimentPlateId,
            assayName: plateInfo.barcode + "_" + createLibrarystockResult.well,
            well: createLibrarystockResult.well,
            biosampleId: 1,
            reagentId: createLibrarystockResult.librarystockId,
            isJunk: FormData.junk,
            platePath: 'assays' + image[0],

            metaAssay: JSON.stringify({
                reagentType: 'chemical',
                experimentType: 'organism',
                library: 'chembridge'
            }),
            assayType: 'chemical',
        };

        ExperimentAssay
            .create(createExperimentAssayObj)
            .then(function(result) {
                app.models.WpPosts.assayPostKue(FormData, plateInfo, createLibrarystockResult, result);
                done();
            })
            .catch(function(error) {
                console.log('there was an error! ' + error);
                return done(new Error(error));
            });

    };

    ExperimentAssay.kue = function(FormData, plateInfo, createLibrarystockResult) {

        var queueObj = {
            title: 'ExperimentAssay-' + plateInfo.experimentPlateId + '-' + plateInfo.barcode + '-' + createLibrarystockResult.well,
            FormData: FormData,
            plateInfo: plateInfo,
            createLibrarystockResult: createLibrarystockResult
        };

        ExperimentAssay.imageKue(queueObj);

        queue.create('createExperimentAssay', queueObj)
            .events(false)
            .removeOnComplete(true)
            .priority('low')
            .save();

        queue.process('createExperimentAssay', function(job, done) {
            ExperimentAssay.processKue(job.data, done);
        });

    };

    ExperimentAssay.imageKue = function(queueObj) {

        //convert image queue
        //console.log('creating image kue!');
        queue.create('PostImageKue', queueObj)
            .events(false)
            .removeOnComplete(true)
            .priority('low')
            .save();

        queue.process('PostImageKue', function(job, done) {
            ExperimentAssay.processImageKue(job.data, done);
        });

    };

};
