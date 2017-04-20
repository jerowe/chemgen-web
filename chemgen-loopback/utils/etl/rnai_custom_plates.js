'use strict';

var app = require('../../server/server.js');
var imageKue = require('../../common/models/Experiment-Assay/ImageKue.js')
var helpers = require('../../common/models/helpers');
var wpUrl = helpers.wpUrl();

var agenda = require('../../agenda/worker.js');

var Promise = require('bluebird');
var fs = require('fs');
var csv = require('fast-csv');
var slug = require('slug');

var rows = helpers.rows();
var cols = helpers.cols();
var overAll = [];
var chrom = '';
var screenName = '';
var creationDates = [];

rows.map(function(row) {
  cols.map(function(col) {
    overAll.push(row + col);
  });
});

// overAll = ['A01'];


var findPlates = function(data) {
  var creationDates = [
    {
      creationdate: '2017-04-08'
    },
    {
      creationdate: '2017-04-09'
    },
    {
      creationdate: '2017-03-13'
    },
    {
      creationdate: '2017-03-14'
    },
  ];

  return new Promise(function(resolve, reject) {
    app.models.Plate.find({
      where: {
        and: [
          {
            or: [
              {
                name: {
                  like: '%' + 'RNA%'
                }
              }, {
                name: {
                  like: 'L4440%'
                }
              }
            ]
          }, {
            or: creationDates
          }
        ]
      }
    }).then(function(results) {
      return parsePlates(results)
    // resolve(results);
    })
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      });

  });
};

var parsePlates = function(results) {

  return new Promise(function(resolve, reject) {
    Promise.map(results, function(val, index) {
      // console.log(val);
      val.barcode = val.name;
      return passImageKue(val);
    }).then(function(results) {
      resolve(results);
    }).catch(function(error) {
      reject(new Error(error));
    });
  });

};

var passImageKue = function(data) {

  data.imagePath = data.imagepath;
  data.instrumentPlateId = data.csPlateid;

  return new Promise(function(resolve, reject) {

    Promise.map(overAll, function(val, index) {
      var imageKueData = {
        plateInfo: data,
        createLibrarystockResult: {
          well: val
        }
      };
      // return imageKueData;
      resolve(agenda.now('imageKue', imageKueData));
    // agenda.now('imageKue', imageKueData);
    // resolve();
    })
      // .then(function(results) {
      //   resolve(results);
      // })
      .catch(function(error) {
        reject(new Error(error));
      });
  });

};

findPlates()
  .then(function(results) {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(function(error) {
    console.log('There was an error!' + error);
  });
