module.exports = function(ChemicalLibrarystock) {

    var app = require('../../server/server.js');
    var Promise = require('bluebird');
    var kue = require('kue');
    var queue = kue.createQueue();
    var _ = require('lodash');

    ChemicalLibrarystock.list96Wells = function() {
    //function list96Wells() {

        var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        var cols = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        //var rows = ['A', 'B'];
        //var cols = ['01', '02'];
        var allVals = [];

        rows.map(function(row){
            cols.map(function(col){
                allVals.push(row + col);
            });
        });

        return allVals;
    };


    function createChemicalLibrarystock(FormData, plateInfo, createObj) {

        return new Promise(function(resolve, reject) {

            ChemicalLibrarystock
                .create(createObj)
                .then(function(result) {
                    result.taxTerm = createObj.taxTerm;
                    result.well = createObj.well;
                    app.models.ExperimentAssay.kue(FormData, plateInfo, result);
                    resolve();
                })
                .catch(function(error) {
                    console.log('there was an error!' + error);
                    reject(error);
                });

        });
    }

    function processLibraryResults(FormData, plateInfo, chembridgeResults) {

        var allWells = ChemicalLibrarystock.list96Wells();

        return new Promise(function(resolve, reject) {

            Promise.map(allWells, function(well) {

                    var chembridgeResult = _.find(chembridgeResults, 'coordinate', well);

                    if (!chembridgeResult) {
                        chembridgeResult = {};
                        chembridgeResult.name = 'chembridge_empty';
                    }

                    var createStock = {
                        plateId: plateInfo.experimentPlateId,
                        parentstockId: chembridgeResult.chembridgelibraryId,
                        well: well,
                        taxTerm: chembridgeResult.name,
                        metaLibrarystock: JSON.stringify({
                            library: 'chembridge'
                        }),
                    };

                    return createChemicalLibrarystock(FormData, plateInfo, createStock);
            }, {concurrency: 1})
                .then(function(){
                    resolve();
                })
                .catch(function(error) {
                    console.log('there was an error ' + error);
                    reject(error);
                });

        });

    }

    ChemicalLibrarystock.processkue = function(data, done) {

        var FormData = data.FormData;
        var plateInfo = data.plateInfo;
        var plateObj = app.models.ChemicalChembridgelibrary.parseBarcode(plateInfo.barcode);

        //Each well should be a queue
        app.models.ChemicalChembridgelibrary.findWell(plateObj.plateName)
            .then(function(libraryResults) {
                return processLibraryResults(FormData, plateInfo, libraryResults);
            })
            .then(function() {
                done();
            })
            .catch(function(error) {
                return done(new Error(error));
            });

    };

    ChemicalLibrarystock.kue = function(FormData, plateInfo) {

        var queueObj = {
            title: 'ChemicalLibrarystock-' + plateInfo.experimentPlateId + '-' + plateInfo.barcode,
            FormData: FormData,
            plateInfo: plateInfo
        };
        queue.watchStuckJobs(6000);

        queue.create('createChemicalLibrarystock', queueObj)
            .events(false)
            .priority('critical')
            .save();

        queue.process('createChemicalLibrarystock', 1, function(job, done) {
            ChemicalLibrarystock.processkue(job.data, done);
        });

    };
};
