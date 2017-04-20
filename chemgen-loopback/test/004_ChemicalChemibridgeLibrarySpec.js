'use strict';

var app = require('../server/server.js');
var expect = require('chai').expect;

var ChemicalChembridgelibrary = app.models.ChemicalChembridgelibrary;

describe('004_ChemicalChembridgeLibrarySpec', function() {
  it('parses barcode with dilution', function() {
    var parsed = ChemicalChembridgelibrary.parseBarcode('M1M2M3M43DQ1');
    var expectPlateObj = {
      'plateList': ['1', '2', '3', '4'],
      'Q': '1',
      'plateIndex': '1',
      'D': '3',
      'plateName': '0001',
    };
    expect(parsed).to.deep.equal(expectPlateObj);
  });
  it('parses barcode without dilution', function() {
    var parsed = ChemicalChembridgelibrary.parseBarcode('M1M2M3M4Q1');
    var expectPlateObj = {
      'plateList': ['1', '2', '3', '4'],
      'Q': '1',
      'plateIndex': '1',
      'plateName': '0001',
    };
    expect(parsed).to.deep.equal(expectPlateObj);
  });
});
