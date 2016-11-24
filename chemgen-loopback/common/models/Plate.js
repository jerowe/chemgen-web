module.exports = function(Plate){

    var Promise = require('bluebird');

    Plate.getList = function(plate){

        return new Promise(function(resolve, reject) {

            Plate.find({
                    where: {
                        csPlateid: {
                            between: [plate.plateStart, plate.plateEnd]
                        }
                    }
                })
                .then(function(results) {
                    var plateIds = results.map(function(obj) {
                        var newObj = {
                            plateStartTime: obj.platestarttime,
                            csPlateid: obj.csPlateid,
                            barcode: obj.name,
                            imagePath: obj.imagepath
                        };
                        return newObj;
                    });
                    resolve(plateIds);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    };

};
