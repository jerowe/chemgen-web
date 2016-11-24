module.exports = function(ExperimentExperimentplate) {

    //var Promise = require('bluebird');
    var kue = require('kue');
    var queue = kue.createQueue();
    var app = require('../../server/server.js');

    ExperimentExperimentplate.processKue = function(FormData, createObj, done) {

        console.log('In ExperimentExperimentplate.processKue');

        ExperimentExperimentplate
            .create(createObj)
            .then(function(result) {
                //Do I need this?
                //I think I am carrying around plateInfo anyways...
                result.imagePath = createObj.imagePath;
                //console.log('ExperimentPlate process.kue result are ' + JSON.stringify(result));
                app.models.ChemicalLibrarystock.kue(FormData, result);
                app.models.WpPosts.ExperimentPlatePost(FormData,  result);
                //doNextThing
                done();
            })
            .catch(function(error) {
                console.log('there was an error! ' + error);
                return done(new Error(error));
            });
    };

    ExperimentExperimentplate.kue = function(input) {

        var FormData = input.FormData;
        var plateInfo = input.plateInfo;

        var createObj = {
            title: 'ExperimentExperimentplate-' + FormData.screenId + '-' + FormData.instrumentId + '-' + plateInfo.csPlateid + '-' + plateInfo.barcode,
            imagePath: plateInfo.imagePath,
            screenId: FormData.screenId,
            barcode: plateInfo.barcode,
            screenStage: FormData.screenStage,
            temperature: FormData.temperature,
            instrumentId: FormData.instrumentId,
            instrumentPlateId: plateInfo.csPlateid,
        };


        queue.create('createExperimentPlate', createObj)
            .events(false)
            .priority('high')
            .removeOnComplete(true)
            .save();

        queue.process('createExperimentPlate', function(job, done) {
            ExperimentExperimentplate.processKue(FormData, job.data, done);
        });

        return;
        //cb(null, 'Job submitted: ' + createObj.title);
    };

    //ExperimentExperimentplate.remoteMethod(
    //'kue',
    //{
    //accepts: [ {arg: 'FormData', type: 'object'}, {arg: 'plateInfo', type: 'object'}],
    //returns: {arg: 'msg', type: 'string'}
    //}
    //);

};
