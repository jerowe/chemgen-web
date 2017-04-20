var app = require('../../server/server.js');
var imageKue = require('../../common/models/Experiment-Assay/ImageKue.js');
var AssayImagePost = require('../../common/models/Wp-Posts/AssayImagePost.js');
var AssayPost = require('../../common/models/Wp-Posts/AssayPost.js');

module.exports = function(agenda) {

  agenda.define('imageKue', function(job, done) {
    imageKue.processImageKue(job.attrs.data, done);
  });

  agenda.define('createTermTaxonomy', function(job, done) {
    app.models.WpTermTaxonomy.preProcessKue(job.attrs.data, done);
  });

  agenda.define('createTermRelationships', function(job, done) {
    app.models.WpTermRelationships.preProcessKue(job.attrs.data, done);
  });

  agenda.define('createWpTerms', function(job, done) {
    app.models.WpTerms.processKue(job.attrs.data, done);
  });

  agenda.define('RnaiLibrarystockProcessVendorPlates', function(job, done) {
    app.models.RnaiLibrarystock.processVendorPlates(job.attrs.data, done);
  });

  agenda.define('createExperimentPlate', function(job, done) {
    app.models.ExperimentExperimentplate.processKue(job.attrs.data, done);
  });

  agenda.define('RnaiCreateStockKue', function(job, done) {
    app.models.RnaiLibrarystock.processCreateStock(job.attrs.data, done);
  });

  agenda.define('createExperimentAssayPost', function(job, done) {
    AssayPost.assayProcessKue(job.attrs.data, done);
  });

  agenda.define('createExperimentAssay', function(job, done) {
    // app.models.ExperimentAssay.preProcessKue(job.attr.sdata, done);
    // app.models.ExperimentAssay.kue(job.attr.sdata, done);
    app.models.ExperimentAssay.processKue(job.attrs.data, done);
  });
};
