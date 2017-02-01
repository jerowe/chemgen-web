module.exports = function(WpTermRelationships) {

  var kue = require('kue');
  var queue = kue.createQueue({redis: 'redis://10.230.9.222:6379'});
  //var Promise = require('bluebird');
  //var app = require('../../server/server.js');

  WpTermRelationships.processKue = function(data, done) {

    //console.log('in create term relatonships!!!');
    var createTermObj = data.createTermObj;

    WpTermRelationships.findOrCreate({
      where: createTermObj
    }, createTermObj).then(function() {
      done();
    }).catch(function(error) {
      console.log('WpTermRel.processKue! ' + JSON.stringify(error));
      return done(new Error(error));
    });

  };

  WpTermRelationships.kue = function(createTermTaxonomyResult) {

    var createTermObj = {
      termTaxonomyId: createTermTaxonomyResult.termTaxonomyId,
      termOrder: 0,
      objectId: createTermTaxonomyResult.postId
    };

    var queueName = 'createTermRelationships';

    var queueObj = {
      title: queueName + '-',
      createTermObj: createTermObj
    };

    queue.create(queueName, queueObj).events(false).removeOnComplete(true).ttl(60000).priority('low').attempts(3).save();

    queue.process(queueName, 1, function(job, done) {
      WpTermRelationships.processKue(job.data, done);
    });

  };

};
