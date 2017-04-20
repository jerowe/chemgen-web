'use strict';

var helpers = require('../helpers');
var chemicalHelper = require('./003_ChemicalLibrarystock.js');

var chemicalStockExpect = chemicalHelper.stockExpect;
var FormData = helpers.FormData;
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult;
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;

exports.kueExpect = [{
  title: 'ExperimentAssay-1-M1M2M3M43DQ1-B10',
  FormData: FormData,
  plateInfo: t,
  createLibrarystockResult: chemicalStockExpect[0],
}];

exports.prepareExperimentAssayResult = {
  'plateId': 1,
  'assayName': 'M1M2M3M43DQ1_B10',
  'well': 'B10',
  'biosampleId': 1,
  'reagentId': 1,
  'isJunk': 1,
  'platePath': 'assays/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg',
  'metaAssay': JSON.stringify({
    reagentType: 'chemical',
    'experimentType': 'organism',
    library: 'chembridge',
  }),
  'assayType': 'chemical',
};

exports.createExperimentAssayResult = {
  'assayId': 1,
  'plateId': 1,
  'assayName': 'M1M2M3M43DQ1_B10',
  'well': 'B10',
  'biosampleId': 1,
  'reagentId': 1,
  'isJunk': 1,
  'platePath': 'assays/2014Dec08/966/M1M2M3M43DQ1_B10-autolevel.jpeg',
  'metaAssay': JSON.stringify({
    reagentType: 'chemical',
    'experimentType': 'organism',
    library: 'chembridge',
  }),
  'assayType': 'chemical',
};
