'use strict';

module.exports = function(ChemicalChembridgelibrary) {

  var Promise = require('bluebird');

  ChemicalChembridgelibrary.parseBarcode = function(barCode) {
    var origList = barCode.split('M');
    var last = origList[4];
    var regexp = /(\d{1})DQ(\d{1})/;
    var plateData = regexp.exec(last);
    var pad = '0000';
    var plateObj = {};
    var newLast;
    var plateList;

    if (plateData) {
      newLast = last.replace(plateData[0], '');
      plateList = [origList[1], origList[2], origList[3], newLast];

      plateObj = {
        plateList: plateList,
        Q: plateData[2],
        plateIndex: plateList[plateData[2] - 1],
        D: plateData[1],
      };
    } else {
      regexp = /Q(\d{1})/;

      plateData = regexp.exec(last);

      newLast = last.replace(plateData[0], '');
      plateList = [origList[1], origList[2], origList[3], newLast];

      plateObj = {
        plateList: plateList,
        Q: plateData[1],
        plateIndex: plateList[plateData[1] - 1],
      };
    }

    var plateIndexStr = String(plateObj.plateIndex);
    plateObj.plateName = pad.substring(0, pad.length - plateIndexStr.length) + plateIndexStr;

    return plateObj;
  };

  ChemicalChembridgelibrary.findWells = function(plate) {
    return new Promise(function(resolve, reject) {
      ChemicalChembridgelibrary
        .find({
          where: {
            plate: plate,
          },
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
