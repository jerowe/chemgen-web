'use strict';

//TODO
//This file should only handle routes
//Move all the function over the plate

module.exports = function(app) {
  var Promise = require('bluebird');
  var FormData = {};


  //Takes as its input FormData - which should look like This
  // {
  //   "currentDate": "2017-01-23T11:00:02.037Z",
  //   "screen": "1",
  //   "library": "2",
  //   "screenSstage": 1,
  //   "junk": "1",
  //   "temperature": "22.5",
  //   "instrumentId": "1",
  // plates: [
  //   {"plateStart": "966",
  //   "plateEnd": "967",}, ]
  // }

  /**
   * TODO - name this something else
   * This starts the workflow for inputting data to the database 
   * Starting processing
   * @type {Object} FormData
   */
  app.post('/getPlateList', function(req, res) {
    FormData = req.body.FormData;

    app.models.Plate.processFormData(FormData)
      .then(function() {
        res.send('ok!');
      })
      .catch(function(error) {
        res.status(500).send(error);
      });
  });
};
