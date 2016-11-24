module.exports = function(ChemicalChembridgelibrary) {

    var Promise = require('bluebird');

    ChemicalChembridgelibrary.parseBarcode = function(barCode) {

        var orig_list = barCode.split('M');
        var last = orig_list[4];
        var regexp = /(\d{1})DQ(\d{1})/;
        var plateData = regexp.exec(last);
        var pad = "0000";
        var plateObj = {};
        var new_last;
        var plate_list;

        if (plateData) {
            new_last = last.replace(plateData[0], '');
            plate_list = [orig_list[1], orig_list[2], orig_list[3], new_last];

            plateObj = {
                plateList: plate_list,
                Q: plateData[2],
                plateIndex: plate_list[plateData[2] - 1],
                D: plateData[1]
            };
        } else {
            regexp = /Q(\d{1})/;

            plateData = regexp.exec(last);

            new_last = last.replace(plateData[0], '');
            plate_list = [orig_list[1], orig_list[2], orig_list[3], new_last];

            plateObj = {
                plateList: plate_list,
                Q: plateData[1],
                plateIndex: plate_list[plateData[1] - 1]
            };
        }

        var plateIndexStr = String(plateObj.plateIndex);
        plateObj.plateName = pad.substring(0, pad.length - plateIndexStr.length) + plateIndexStr;

        return plateObj;
    };

    ChemicalChembridgelibrary.findWell = function(plate) {

        return new Promise(function(resolve, reject) {

            ChemicalChembridgelibrary
                .find({
                    where: {
                        plate: plate
                    }
                })
                .then(function(results) {
                    //console.log('chembridgeResults are ' + )
                    //resolve(processChembridgeResults(plateInfo, well, results));
                    resolve(results);
                })
                .catch(function(error) {
                    reject(error);
                });

        });
    };

};
