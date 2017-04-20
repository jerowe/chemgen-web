'use strict';

var app = require('../../server/server.js');
var imageKue = require('../../common/models/Experiment-Assay/ImageKue.js')
var helpers = require('../../common/models/helpers');
var wpUrl = helpers.wpUrl();

var agenda = require('../../agenda/worker.js');

// console.log('agenda is ' + JSON.stringify(agenda, null, 2));

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

overAll = ['A01'];

var file = './10_RNAi_mel-28.tsv';
// var file = './RNAi_mel-28.tsv';

var parseCreationDates = function(dateStr) {
  var dates = dateStr.split(',');
  dates.map(function(date, index) {
    var dateObj = {
      creationdate: date
    };
    dates[index] = dateObj;
  });
  return dates;
};

var startStream = function(file) {
  var stream = fs.createReadStream(file);

  var csvStream = csv.fromStream(stream, {
    headers: true,
    delimiter: '\t'
  }).on("data", function(data) {
    // csvStream.pause();
    decideData(data).then(function() {}).catch(function(error) {
      console.log('we got an error! ' + error);
    });
  }).on("end", function() {
    console.log("csv stream done");
  // process.exit(0);
  }).on("close", function() {
    console.log("csv stream end");
  // process.exit(0);
  });

  stream.pipe(csvStream);
  stream.on('close', function() {
    console.log('stream done');
  // process.exit(0);
  });
  stream.on('end', function() {
    console.log('stream end');
  // process.exit(0);
  });
};

agenda.on('ready', function() {
  startStream(file);
});

var createScreen = function(data) {
  var screenName = '';

  if (data['Assay date']) {
    var assayDates = data['Assay date'].split('/');
    var day = assayDates[0];
    day = ("00" + day).slice(-2)
    var month = assayDates[1];
    month = ("00" + month).slice(-2)
    var year = assayDates[2];

    screenName = screenName + slug(year + '-' + month + '-' + day);
  }
  if (data['Screen type']) {
    var cond = '';
    if (data['Screen type'].match('Enhancer')) {
      cond = 'E';
    }
    if (data['Screen type'].match('Suppressor')) {
      cond = cond + 'S';
    }
    screenName = screenName + '--' + cond;
  }

  if (data['Worm Strain']) {
    var strain = '';
    if (data['Worm Strain'].match('N2')) {
      strain = 'N';
    }
    if (data['Worm Strain'].match('mel')) {
      strain = strain + 'M';
    }
    screenName = screenName + '--' + strain;
  }

  return screenName;
}

var decideData = function(data) {

  data.creationDates = creationDates;

  if (data['Chromosome no.']) {
    chrom = data['Chromosome no.'];
  }
  if (data['Library Screen type']) {
    //Create a new screen
  }
  if (data['CreationDate']) {
    creationDates = parseCreationDates(data['CreationDate']);
    data.creationDates = creationDates;
  }

  return new Promise(function(resolve, reject) {

    if (data['Library']) {
      data.screenName = createScreen(data);
    }

    if (data['RNAi plate no.']) {
      // console.log(JSON.stringify(data, null, 2));
      var FormData = {
        library: 'RNAi',
        junk: 0,
        RnaiPlateNo: data['RNAi plate no.'],
        chrom: chrom,
        AssayDate: data['Assay date'],
        Controls: data['Controls'],
        WormStage: data['Worm Stage'],
        screenStage: 1,
        StampDate: data['RNAi Stamp date'],
        CultureDate: data['Culture date'],
        FreezeDate: data['Freeze date'],
        IPTGInductionDate: data['IPTG induction date'],
        EnhancerTemp: data['Enhancer temp'],
        EhancerImageDate: data['Enhancer Imaging and OD date'],
        SuppressorTemp: data['Suppressor temp'],
        SuppressorImageDate: data['Suppressor Imaging and OD date'],
        Comments: data['Comments'],
        instrumentId: 1,
        screenId: 1,
        screenName: data.screenName,
        reagentType: 'rnai'
      };
      // console.log('formdata is ' + JSON.stringify(FormData, null, 2));

      var barcode = 'RNAi' + chrom + '.' + data['RNAi plate no.'];
      data.barcode = barcode;
      data.instrumentPlateId = data.csPlateid;

      findPlates(data)
        .then(function(results) {
          // console.log('Find Plates results are ' + JSON.stringify(results, null, 2));
          // console.log('agenda is ' + JSON.stringify(agenda, null, 2));
          // resolve(results);
          // return app.models.RnaiLibrarystock.processVendorPlates({
          //   FormData: FormData,
          //   plates: results
          // });
          return app.models.RnaiLibrarystock.kue(FormData, results);
        // resolve(results);
        })
        .then(function(results) {
          // console.log(JSON.stringify(results, null, 2));
          resolve(results);
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    }
  });

};

var processPlates = function(plates) {};

var findPlates = function(data) {

  return new Promise(function(resolve, reject) {
    app.models.Plate.find({
      where: {
        and: [
          {
            or: [
              {
                name: {
                  like: '%' + data.barcode + '%'
                }
              }, {
                name: {
                  like: 'L4440%'
                }
              }
            ]
          }, {
            or: data.creationDates
          }
        ]
      }
    }).then(function(results) {
      // console.log('after find plates');
      // return parsePlates(results, data.barcode)
      // // resolve(results);
      // var plateIds = app.models.Plate.processPlateResults(results);
      resolve(results);
    })
      // .then(function(results) {
      //   resolve(results);
      // })
      .catch(function(error) {
        reject(new Error(error));
      });

  });
};

var parsePlates = function(results, barcode) {

  return new Promise(function(resolve, reject) {
    Promise.map(results, function(val, index) {
      // console.log(val);
      val.barcode = barcode;
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
      resolve(agenda.now('imageKue', imageKueData));
    // agenda.now('imageKue', imageKueData);
    // resolve();
    })
      // .then(function() {
      //   resolve();
      // })
      .catch(function(error) {
        reject(new Error(error));
      });
  });

};
