/* @flow */
'use strict';

var slug = require('slug');

exports.createTags = function(FormData, plateInfo) {

  if (!FormData) {
    return [];
  }

  var genTags = createTagsAll(FormData, plateInfo);
  var tags;
  if ('library' in FormData) {
    if (FormData.library === 'RNAi') {
      tags = createTagsRnai(genTags, FormData, plateInfo);
      tags = filterTags(tags);
      return tags;
    } else {
      tags = filterTags(genTags);
      return tags;
    }
  } else {
    tags = filterTags(genTags);
    return tags;
  }

};

var filterTags = function(tags) {
  var cleanTags = [];

  tags.map(function(tag) {
    if (tag.taxTerm) {
      cleanTags.push(tag);
    }
  });

  return cleanTags;
}

var createTagsRnai = function(tags, FormData, plateInfo) {

  var barcode = plateInfo.ExperimentExperimentplate.barcode;

  var shortBarcode = barcode.replace('_D', '');

  //TODO add checks for undefined values
  tags.push({
    taxonomy: 'rnai_assay_date',
    taxTerm: FormData.AssayDate
  });
  tags.push({
    taxonomy: 'rnai_stamp_date',
    taxTerm: FormData.StampDate
  });
  tags.push({
    taxonomy: 'rnai_freeze_date',
    taxTerm: FormData.FreezeDate
  });
  tags.push({
    taxonomy: 'rnai_culture_date',
    taxTerm: FormData.CultureDate
  });
  tags.push({
    taxonomy: 'rnai_iptg_date',
    taxTerm: FormData.IPTGInductionDate
  });
  tags.push({
    taxonomy: 'rnai_enhancer_temp',
    taxTerm: FormData.EnhancerTemp
  });
  tags.push({
    taxonomy: 'rnai_enhancer_image_date',
    taxTerm: FormData.EnhancerImageDate
  });
  tags.push({
    taxonomy: 'rnai_suppressor_temp',
    taxTerm: FormData.SuppressorTemp
  });
  tags.push({
    taxonomy: 'rnai_suppressor_image_date',
    taxTerm: FormData.SuppressorImageDate
  });
  tags.push({
    taxonomy: 'experiment_comment',
    taxTerm: FormData.Comments
  });

  if (barcode) {
    if (barcode.match('M') || barcode.match('mel')) {
      tags.push({
        taxonomy: 'worm_strain',
        taxTerm: 'mel-28',
      });
    } else {
      tags.push({
        taxonomy: 'worm_strain',
        taxTerm: 'N2',
      });
    }
  }

  return tags;
};

var createTagsAll = function(FormData, plateInfo) {
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
    taxonomy: 'screen_name',
    taxTerm: FormData.screenName || 'test',
  }, {
    taxonomy: 'barcode',
    taxTerm: plateInfo.ExperimentExperimentplate.barcode,
  }, {
    taxonomy: 'envira-tag',
    taxTerm: plateInfo.ExperimentExperimentplate.barcode,
  }, {
    taxonomy: 'screen_stage',
    taxTerm: screenStage,
  }, {
    taxonomy: 'temperature',
    taxTerm: FormData.temperature,
  }, {
    taxonomy: 'junk',
    taxTerm: junk,
  }];

};

exports.createTagsChemical = function(tags, FormData, plateInfo) {
  tags.push({
    taxonomy: 'worm_strain',
    taxTerm: 'N2',
  });
  return tags;
};

exports.rows = function() /*: Array<string> */ {
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
// return ['A'];
};

exports.cols = function() /*: Array<string> */ {
  return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
// return ['01', '02'];
};

exports.list96Wells = function() {
  var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  var cols = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  var allVals = [];

  rows.map(function(row) {
    cols.map(function(col) {
      allVals.push(row + col);
    });
  });

  return allVals;
};

exports.wpUrl = function() /*: string */ {
  return process.env.wpUrl || 'http://onyx.abudhabi.nyu.edu/wordpress';
};

exports.imageMeta = function(imagePath /*: string */ , baseImage /*: string */ ) {

  // We are generating this straight from wordpress now in a plugin
  return '';
};
