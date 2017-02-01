/* @flow */
'use strict';

var slug = require('slug');

exports.createTags = function(FormData /*: FormData */ ,
  plateInfo /*: plateInfo */ ) /*: Array<Object> */ {
  if (!FormData) {
    return [];
  }

  var screenStage = '';
  // if (!('screenStage' in FormData)) {
  //   screenStage = 'Unknown';
  // }
  if (FormData.screenStage === 1) {
    screenStage = 'Primary';
  } else if (FormData.screenStage === 2) {
    screenStage = 'Secondary';
  }

  var junk = '';
  if (FormData.junk === 1) {
    junk = 'Junk';
  } else if (FormData.junk === 0) {
    junk = 'Not Junk';
  }

  return [{
    taxonomy: 'screen',
    taxTerm: FormData.screenName || 'test',
  }, {
    taxonomy: 'barcode',
    taxTerm: plateInfo.barcode,
  }, {
    taxonomy: 'screen_stage',
    taxTerm: screenStage,
  }, {
    taxonomy: 'temperature',
    taxTerm: FormData.temperature,
  }, {
    taxonomy: 'junk',
    taxTerm: junk,
  }, {
    taxonomy: 'worm_strain',
    taxTerm: 'N2',
  }];
};

exports.rows = function() /*: Array<string> */ {
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
// return ['A'];
};

exports.cols = function() /*: Array<string> */ {
  return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
// return ['01', '02'];
};

exports.wpUrl = function() /*: string */ {
  return process.env.wpUrl || 'http://onyx.abudhabi.nyu.edu/wordpress';
};

exports.imageMeta = function(imagePath /*: string */ , baseImage /*: string */ ) {

  // We are generating this straight from wordpress now in a plugin
  return '';
};
