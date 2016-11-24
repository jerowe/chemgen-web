'use strict';

/**
 * @ngdoc service
 * @name chemgenClientApp.chemicalChembridge
 * @description
 * # chemicalChembridge
 * Service in the chemgenClientApp.
 */
angular.module('chemgenClientApp')
    .service('chemicalChembridgeService', function($q, ChemicalChembridgelibrary, ChemicalLibrarystock, ExperimentAssay) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        //TODO add this to the validation message

        function queryChembridge(plate, well) {

            var deffered = $q.defer();

            ChemicalChembridgelibrary
                .find({
                    filter: {
                        where: {
                            plate: plate,
                            coordinate: well,
                        }
                    }
                })
                .$promise
                .then(function(results) {
                    deffered.resolve(results);
                });

            return deffered.promise;
        };

        function listWells() {

            var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'H'];
            var cols = [];

            for (var y = 1; y <= 12; y++) {

                var str = "" + y;
                var pad = "00";
                var ans = pad.substring(0, pad.length - str.length) + str;

                cols.push(ans);
            }

            var allVals = [];

            for (var x in rows) {
                var row = rows[x];

                for (var y in cols) {
                    var col = cols[y];
                    allVals.push(row + col);
                }

            }

            return allVals;
        };

        function parseBarcode(barCode) {

            var orig_list = barCode.split('M');
            var last = orig_list[4];
            var regexp = /(\d{1})DQ(\d{1})/;
            var plateData = regexp.exec(last);

            var plateObj = {};
            if (plateData) {
                var new_last = last.replace(plateData[0], '');
                var plate_list = [orig_list[1], orig_list[2], orig_list[3], new_last];

                plateObj = {
                    plateList: plate_list,
                    Q: plateData[2],
                    plateIndex: plate_list[plateData[2] - 1],
                    D: plateData[1]
                };
            } else {
                regexp = /Q(\d{1})/;

                plateData = regexp.exec(last);

                var new_last = last.replace(plateData[0], '');
                var plate_list = [orig_list[1], orig_list[2], orig_list[3], new_last];

                plateObj = {
                    plateList: plate_list,
                    Q: plateData[1],
                    plateIndex: plate_list[plateData[1] - 1]
                };
            }

            var str = "" + plateObj.plateIndex;
            var pad = "0000";
            plateObj.plateName = pad.substring(0, pad.length - str.length) + str;

            return plateObj;
        };

        function getChembridgelibraryId(results) {

            if (results[0]) {

                var result = results[0];
                if ("chembridgelibraryId" in result) {
                    return result.chembridgelibraryId;
                }

            } else {
                return undefined;
            }
        }

        function createChemicalLibrarystock(createObj) {

            var deffered = $q.defer();

            ChemicalLibrarystock
                .create(createObj)
                .$promise
                .then(function(results) {
                    deffered.resolve(results);
                });
            return deffered.promise;
        };

        function createExperimentAssay(createObj) {

            var deffered = $q.defer();

            ExperimentAssay
                .create(createObj)
                .$promise
                .then(function(results) {
                    deffered.resolve(results);
                });
            return deffered.promise;

        }

        return {

            populateAssayTable: function(plateInfo, experimentPlateId, isJunk) {

                var imageArray = plateInfo.imagePath.split('\\');
                var folder = imageArray[4];
                var imageId = imageArray[5];

                var imagePath = '/mnt/Plate_Data/' + folder + '/' + imageId + '/' + imageId;
                var ext = "f00d0.C01";

                var outImagePath = '/var/data/convert/' + folder + '/' + '/' + imageId + '/' + imageId;

                var plateObj = parseBarcode(plateInfo.barcode);

                var allWells = listWells();

                angular.forEach(allWells, function(well, index) {

                    var image = imagePath +  '_' +  well + ext;
                    //console.log('image is ' + image);

                    queryChembridge(plateObj.plateName, well)
                        .then(function(results) {

                            var chembridgeId = getChembridgelibraryId(results);

                            var createStock = {
                                plateId: experimentPlateId,
                                parentstockId: chembridgeId,
                                well: well,
                                metaLibrarystock: JSON.stringify({
                                    library: 'chembridge'
                                }),
                            };


                            createChemicalLibrarystock(createStock)
                                .then(function(stockResult) {

                                    var createAssay = {
                                        plateId: experimentPlateId,
                                        assayName: plateInfo.barcode + "_" + well,
                                        well: well,
                                        biosampleId: 1,
                                        reagentId: stockResult.librarystockId,
                                        isJunk: isJunk,
                                        metaAssay: JSON.stringify({
                                            reagentType: 'chemical',
                                            experimentType: 'organism',
                                            library: 'chembridge'
                                        }),
                                        assayType: 'chemical',
                                    };

                                    createExperimentAssay(createAssay)
                                        .then(function(experimentResult) {
                                            //console.log('we created an experimentAssay ' + JSON.stringify(experimentResult));
                                        });
                                });


                        });
                });


            }
        };
    });
