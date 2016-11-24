module.exports = function(WpTermRelationships) {

    var kue = require('kue');
    var queue = kue.createQueue();
    //var Promise = require('bluebird');
    //var app = require('../../server/server.js');

    WpTermRelationships.processKue = function(data, done) {

        //console.log('in create term relatonships!!!');
        var createTermObj = data.createTermObj;

        WpTermRelationships
            .findOrCreate({
                where: createTermObj
            }, createTermObj)
            .then(function() {
                done();
            })
            .catch(function(error) {
                console.log('creating term relationship there is an error! ' + JSON.stringify(error));
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
            createTermObj: createTermObj,
        };

        queue.create(queueName, queueObj)
            .events(false)
            .removeOnComplete(true)
            .priority('low')
            .attempts(3)
            .save();

        queue.process(queueName, 1, function(job, done) {
            WpTermRelationships.processKue(job.data, done);
        });

    };

};
