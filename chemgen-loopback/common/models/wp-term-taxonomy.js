module.exports = function(WpTermTaxonomy) {

  //var slug = require('slug');
  var app = require('../../server/server.js');
  // var queue = app.queue;
  var Promise = require('bluebird');
  var agenda = app.agenda;

  WpTermTaxonomy.processKue = function(data) {

    var createTermTaxonomyObj = data.createTermTaxonomyObj;
    var postId = data.postId;

    return new Promise(function(resolve, reject) {

      WpTermTaxonomy.findOrCreate({
        where: {
          taxonomy: createTermTaxonomyObj.taxonomy,
          termId: createTermTaxonomyObj.termId
        }
      }, createTermTaxonomyObj)
        .then(function(results) {
          var result = results[0];
          result.postId = postId;
          resolve(result);
        })
        .catch(function(error) {
          console.log('error is ' + JSON.stringify(error));
          reject(new Error(error));
        });
    });

  };

  WpTermTaxonomy.preProcessKue = function(data, done) {
    Promise.map(data.createTermTaxonomyObjs, function(createObj) {
      var createTermTaxonomyObj = {
        termId: createObj.termId,
        taxonomy: createObj.taxonomy,
        description: '',
        parent: 0,
        count: 1
      };
      return WpTermTaxonomy.processKue({
        createTermTaxonomyObj: createTermTaxonomyObj,
        postId: createObj.postId
      })
    })
      .then(function(results) {
        return app.models.WpTermRelationships.kue(results);
      })
      .then(function(results) {
        done();
      })
      .catch(function(error) {
        done(new Error(error));
      });
  };

  WpTermTaxonomy.sanityCheck = function(createTermObj) {

    if (!createTermResult) {
      return 0;
    } else if (typeof createTermResult === 'undefined' || createTermResult === null) {
      return 0;
    } else if (!!createTermResult) {
      return 0;
    } else if (typeof createTermResult.termId === 'undefined' || createTermResult.termId === null) {
      return 0;
    } else if (!createTermResult.termId) {
      return 0;
    } else if (typeof createTermResult.taxonomy === 'undefined' || createTermResult.taxonomy === null) {
      return 0;
    } else if (!createTermResult.taxonomy) {
      return 0;
    } else {
      return 1;
    }

  };

  WpTermTaxonomy.kue = function(data) {

    return new Promise(function(resolve, reject) {
      var queueObj = {
        createTermTaxonomyObjs: data
      };

      agenda.now('createTermTaxonomy', queueObj);
      resolve(queueObj);
    // }
    });

  };

};
