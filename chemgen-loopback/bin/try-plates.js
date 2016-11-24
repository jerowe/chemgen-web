var path = require('path');
var Promise = require('bluebird');
var fs = require('fs');
var kue = require('kue');
var queue = kue.createQueue();

var app = require(path.resolve(__dirname, '../server/server'));

var createTermObjs = [{
    name: 'test',
    slug: 'test',
    termGroup: 0
}, {
    name: 'test',
    slug: 'test',
    termGroup: 0
}];

function sleep(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

function deleteExtra(results){

    var i;
    var result;

    return new Promise(function(resolve, reject){

        for (i = 1; i < results.length; i++) {
            result = results[i];

            app.models.WpTerms.destroyById(result.termId)
                .then(function(){
                    continue;
                })
                .catch(function(error){
                    console.log('there was an error deleting ' + error);
                    reject(error);
                });
        }
        result = results[0];
        resolve(result.termId);

    });
}

function checkFind(result) {

    return new Promise(function(resolve, reject) {

        app.models.WpTerms.find({
                where: {
                    name: result.name,
                    slug: result.slug
                }
            })
            .then(function(results) {
                console.log('results are ' + JSON.stringify(results));
                resolve(results);
            })
            .catch(function(error) {
                console.log('error is ' + error);
                reject(error);
            });

    });
}

createTermObjs.forEach(function(createTermObj) {

    app.models.WpTerms.findOrCreate({
            where: createTermObj,
        }, createTermObj)
        .then(function(results) {
            console.log('results are ' + JSON.stringify(results));
            return checkFind(results[0]);
        })
        .then(function(){
            console.log('done');
        })
        .catch(function(error) {
            console.log('error is ' + JSON.stringify(error));
        });

    sleep(20);

});
