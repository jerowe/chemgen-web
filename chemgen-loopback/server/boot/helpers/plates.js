var app = require('../../server.js');
var Promise = require('bluebird');
var kue = require('kue');
var queue = kue.createQueue();

var FormData = {};

function createExperimentPlate(plateInfo) {

    //Create a ExperimentPlate entry and get back ID
    var create_obj = {
        screenId: FormData.screenId,
        barcode: plateInfo.barcode,
        screenStage: FormData.screenStage,
        temperature: FormData.temperature,
        instrumentId: FormData.instrumentId,
        instrumentPlateId: plateInfo.csPlateid,
    };

    //return new Promise(function(resolve, reject) {

        app.models.ExperimentExperimentplate
            .create(create_obj)
            .then(function(results) {
                createExperimentPlateIds.push(results.experimentPlateId);
                results.imagePath = plateInfo.imagePath;
                //donextthing
                //done();
                //resolve(results);
            })
            .catch(function(error) {
               console.log('there was an error! ' + error);
               //Done Error
                //reject(error);
            });
    //});
}

exports.kueExperimentPlates = function(data){

    FormData = data.FormData;

};
