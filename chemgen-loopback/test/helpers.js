'use strict';

var imagePath = '\\\\aduae120-wap\\CS_DATA_SHARE\\2014Dec08\\';

exports.imagePath = function() {
  return imagePath;
};

/**
 * This is the formdata from the
 * #/angular/experiment_input
 * Form
 * It gets posted to the server at
 * post /getPlates
 */
var FormData = {
  currentDate: '2017-01-23T11:00:02.037Z',
  screenName: 'test',
  screenId: 1,
  library: 2,
  screenStage: 1,
  junk: 1,
  temperature: 22.5,
  instrumentId: 1,
  plates: [
    {
      plateStart: 966,
      plateEnd: 967,
    },
  ],
};

exports.FormData = function() {
  return {
    currentDate: '2017-01-23T11:00:02.037Z',
    screenId: 1,
    screenName: 'test',
    library: 2,
    screenStage: 1,
    junk: 1,
    temperature: 22.5,
    instrumentId: 1,
    plates: [
      {
        plateStart: 966,
        plateEnd: 967,
      },
    ],
  };
};

//We could also just call this as FormData.plates[0]
exports.plate = function() {
  return {
    'plateStart': 966,
    'plateEnd': 967,
  };
};

exports.plateList = function() {
  return [
    {
      barcode: 'M1M2M3M43DQ1',
      csPlateid: 966,
      imagePath: imagePath + 'MFGTMP-PC_141209150001\\',
      plateStartTime: new Date('2014-12-09T15:53:19.000Z'),
    },
    {
      barcode: 'M1M2M3M43DQ2',
      csPlateid: 967,
      imagePath: imagePath + 'MFGTMP-PC_141209150002\\',
      plateStartTime: new Date('2014-12-09T15:57:25.000Z'),
    },
  ];
};

exports.populateExperimentPlateResult = function() {
  return [
    {
      FormData: FormData,
      plateInfo: {
        barcode: 'M1M2M3M43DQ1',
        csPlateid: 966,
        imagePath: imagePath + 'MFGTMP-PC_141209150001\\',
        plateStartTime: new Date('2014-12-09T15:53:19.000Z'),
      },
      'interval': 60000,
    }, {
      FormData: FormData,
      plateInfo: {
        barcode: 'M1M2M3M43DQ2',
        csPlateid: 967,
        imagePath: imagePath + 'MFGTMP-PC_141209150002\\',
        plateStartTime: new Date('2014-12-09T15:57:25.000Z'),
      },
      interval: 120000,
    },
  ];
};

exports.submitKueResult = function() {
  return [{
    'title': 'ExperimentExperimentplate-1-1-966-M1M2M3M43DQ1',
    'imagePath': imagePath + 'MFGTMP-PC_141209150001\\',
    'screenId': 1,
    'barcode': 'M1M2M3M43DQ1',
    'screenStage': 1,
    'temperature': 22.5,
    'instrumentId': 1,
    'instrumentPlateId': 966,
    'plateStartTime': new Date('2014-12-09T15:53:19.000Z'),
  }, {
    'title': 'ExperimentExperimentplate-1-1-967-M1M2M3M43DQ2',
    'imagePath': imagePath + 'MFGTMP-PC_141209150002\\',
    'screenId': 1,
    'barcode': 'M1M2M3M43DQ2',
    'screenStage': 1,
    'temperature': 22.5,
    'instrumentId': 1,
    'instrumentPlateId': 967,
    'plateStartTime': new Date('2014-12-09T15:57:25.000Z'),
  }];
};

exports.ExperimentExperimentplateResult = function() {
  return {
    'ExperimentExperimentplate': {
      'experimentPlateId': 1,
      'barcode': 'M1M2M3M43DQ1',
      'instrumentId': 1,
      'instrumentPlateId': 966,
      'screenId': 1,
      'screenStage': '1',
      'temperature': '22.5',
      'title': 'ExperimentExperimentplate-1-1-966-M1M2M3M43DQ1',
      'imagePath': imagePath + 'MFGTMP-PC_141209150001\\',
      'plateStartTime': new Date('2014-12-09T15:53:19.000Z'),
    },
    'vendorPlate': {
      'imagePath': imagePath + 'MFGTMP-PC_141209150001\\',
      'plateStartTime': new Date('2014-12-09T15:53:19.000Z'),
    },
  };
};
