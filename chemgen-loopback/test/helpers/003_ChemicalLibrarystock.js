'use strict';

var helpers = require('../helpers');
var chembridgeHelper = require('./004_ChemicalChemibridgeLibrary.js');
var ExperimentExperimentplateResult = helpers.ExperimentExperimentplateResult();
var t = ExperimentExperimentplateResult.ExperimentExperimentplate;
var FormData = helpers.FormData();

/**
 * Feed this to the kue
 * @type {Object}
 */
exports.chemicalKueData = {
  libraryResults: [chembridgeHelper.chembridgeDummy],
  FormData: FormData,
  ExperimentExperimentplate: t,
  vendorPlate: ExperimentExperimentplateResult.vendorPlate,
};

/**
 * This is the initial object generated to the ChemicalLibrarystock Workflow
 * It is returned ChemicalLibrarystock.kue
 * @type {Object}
 */
exports.kueResults = {
  title: 'ChemicalLibrarystock-1-M1M2M3M43DQ1',
  FormData: FormData,
  ExperimentExperimentplate: t,
  vendorPlate: ExperimentExperimentplateResult.vendorPlate,
};


exports.stockDummy = [{
  'plateId': 1,
  'parentstockId': 5102336,
  'well': 'B10',
  'taxTerm': 'benzaldehyde [1-(4-biphenylyl)ethylidene]hydrazone',
  'metaLibrarystock': JSON.stringify({
    library: 'chembridge',
  }),
}];

//After creating the stock we have a librarystockId
exports.stockExpect = [{
  'librarystockId': 1,
  'parentstockId': 5102336,
  'plateId': 1,
  'well': 'B10',
  'taxTerm': 'benzaldehyde [1-(4-biphenylyl)ethylidene]hydrazone',
  'metaLibrarystock': JSON.stringify({
    library: 'chembridge',
  }),
}];
