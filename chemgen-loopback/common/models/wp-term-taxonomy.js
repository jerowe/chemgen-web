module.exports = function(WpTermTaxonomy) {

  //var slug = require('slug');
  //var Promise = require('bluebird');
  var kue = require('kue');
  var queue = kue.createQueue({redis: 'redis://10.230.9.222:6379'});
  var app = require('../../server/server.js');

  WpTermTaxonomy.processKue = function(data, done) {

    var createTermTaxonomyObj = data.createTermTaxonomyObj;
    var postId = data.postId;

    WpTermTaxonomy
      .findOrCreate({
        where: createTermTaxonomyObj
      }, createTermTaxonomyObj)
      .then(function(results) {
        var result = results[0];
        result.postId = postId;
        app.models.WpTermRelationships.kue(result);
        done();
      })
      .catch(function(error) {
        console.error('WpTermTaxonomy error ' + error);
        return done(new Error(error));
      });

  };

  //These should be in a separate library for WP helpers
  WpTermTaxonomy.kue = function(createTermResult) {

    var createTermTaxonomyObj = {
      termId: createTermResult.termId,
      taxonomy: createTermResult.taxonomy,
      description: '',
      parent: 0,
      count: 1,
    };

    var queueObj = {
      title: 'createTermTaxonomy-' + createTermResult.postId,
      postId: createTermResult.postId,
      createTermTaxonomyObj: createTermTaxonomyObj,
    };

    queue.create('createTermTaxonomy', queueObj)
      .events(false)
      .removeOnComplete(true)
      .priority('low')
      .attempts(3)
      .ttl(60000)
      .save();

    queue.process('createTermTaxonomy', 1, function(job, done) {
      WpTermTaxonomy.processKue(job.data, done);
    });

  };

};
