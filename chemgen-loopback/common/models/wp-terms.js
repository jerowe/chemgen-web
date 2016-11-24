module.exports = function(WpTerms) {

    var Promise = require('bluebird');
    var slug = require('slug');
    var kue = require('kue');
    var queue = kue.createQueue();
    var app = require('../../server/server.js');

    WpTerms.processKue = function(data, done) {

        var postId = data.postId;
        var createTerms = data.createTerms;

        Promise.map(createTerms, function(createTermObj) {

                if (!createTermObj.taxTerm) {
                    createTermObj.taxTerm = createTermObj.taxonomy + '_empty';
                }

                return WpTerms.createTerm(postId, createTermObj.taxTerm, createTermObj.taxonomy);
            }, {
                concurrency: 1
            })
            .then(function() {
                done();
            })
            .catch(function(error) {
                console.log('there was an error!' + error);
                return done(new Error(error));
            });

    };

    WpTerms.createTerm = function(postId, taxTerm, taxonomy) {

        var createTermObj = {
            name: taxTerm,
            slug: slug(taxTerm),
            termGroup: 0
        };

        return new Promise(function(resolve, reject) {

            WpTerms
                .findOrCreate({
                    where: createTermObj
                }, createTermObj)
                .then(function(results) {
                    var result = results[0];
                    result.postId = postId;
                    result.taxonomy = taxonomy;
                    //resolve(createTermTaxonomy(result));
                    app.models.WpTermTaxonomy.kue(result);
                    resolve();
                })
                .catch(function(error) {
                    console.log('there is an error! ' + JSON.stringify(error));
                    reject(error);
                });
        });
    };

    WpTerms.kue = function(FormData, plateInfo, createLibrarystockResult, createPostResult) {

        return new Promise(function(resolve) {

            var createTerms = [{
                taxonomy: 'chembridge',
                taxTerm: createLibrarystockResult.taxTerm
            }, {
                taxonomy: 'screen',
                taxTerm: FormData.screenName
            }, {
                taxonomy: 'barcode',
                taxTerm: plateInfo.barcode,
            }, {
                taxonomy: 'worm_strain',
                taxTerm: 'N2'
            }];

            var queueObj = {
                title: 'WpTerm-' + plateInfo.experimentPlateId + '-' + plateInfo.barcode + '-' + createLibrarystockResult.well,
                FormData: FormData,
                plateInfo: plateInfo,
                createLibrarystockResult: createLibrarystockResult,
                postId: createPostResult.id,
                createTerms: createTerms,
            };

            queue.create('createWpTerms', queueObj)
                .events(false)
                .priority('low')
                .save();

            queue.process('createWpTerms', 1, function(job, done) {
                WpTerms.processKue(job.data, done);
                resolve();
            });
        });

    };

};
