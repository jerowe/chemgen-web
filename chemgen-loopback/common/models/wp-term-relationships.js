module.exports = function(WpTermRelationships) {

  var Promise = require('bluebird');
  var app = require('../../server/server.js');
  // var queue = app.queue;
  var agenda = app.agenda;

  WpTermRelationships.processKue = function(createTermObj) {

    WpTermRelationships
      .findOrCreate({
        where: createTermObj
      }, createTermObj)
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        return done(new Error(error));
      });
  };

  //To keep or not to keep?
  WpTermRelationships.preProcessKue = function(data, done) {

    Promise.map(data.createTermObjs, function(createTermObj) {
      var createObj = {
        termTaxonomyId: createTermObj.termTaxonomyId,
        termOrder: 0,
        objectId: createTermObj.postId
      };
      return WpTermRelationships.processKue(createObj);
    })
      .then(function(results) {
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  };

  WpTermRelationships.kue = function(createTermTaxonomyResults) {

    var queueObj = {
      createTermObjs: createTermTaxonomyResults,
    };

    agenda.now('createTermRelationships', queueObj);

    return new Promise(function(resolve, reject) {
      resolve(queueObj);
    })
  };

};
