'use strict';

module.exports = function(app) {
  var Promise = require('bluebird');
  var FormData = {};

  function populateExperimentPlate(plateListResults) {
    return new Promise(function(resolve) {
      Promise.map(plateListResults, function(plateInfo) {
        app.models.ExperimentExperimentplate
        .kue({
          FormData: FormData,
          plateInfo: plateInfo,
        });
      });
      resolve();
    });
  }

  function preProcessPlateList(plates) {
    return new Promise(function(resolve, reject) {
      Promise.map(plates, function(plate) {
        return app.models.Plate.getList(plate);
      })
      .then(function(plateListResults) {
        return populateExperimentPlate(plateListResults[0]);
      })
      .then(function() {
        resolve();
      })
      .catch(function(error) {
        console.log('there was an error! ' + error);
        reject(error);
      });
    });
  }

  app.post('/getPlateList', function(req, res) {
    FormData = req.body.FormData;
    console.log('Processing getPlateList ' + JSON.stringify(FormData));
    preProcessPlateList(FormData.plates)
    .then(function() {
      res.send('ok!');
    })
    .catch(function(error) {
      res.status(500).send(error);
    });
  });
};
