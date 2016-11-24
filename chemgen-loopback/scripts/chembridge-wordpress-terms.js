var path = require('path');
var Promise = require('bluebird');
var fs = require('fs');
var slug = require('slug');

var app = require(path.resolve(__dirname, '../server/server'));


function countChembridge(){

    return new Promise(function(resolve, reject) {

        app.models.ChemicalChembridgelibrary
            .count()
            .then(function(results) {
                resolve(results);
            })
            .catch(function(error) {
                console.log('there is an error! ' + error);
            });
    });
};

function queryChembridge() {

    return new Promise(function(resolve, reject) {

        app.models.ChemicalChembridgelibrary
            .find({where: {'plate': '0001'}})
            .then(function(results) {
                resolve(results);
            })
            .catch(function(error) {
                console.log('there is an error! ' + error);
            });
    });
};

function createTerm(result) {

    var createTermObj = {
        name: result.name,
        slug: slug(result.name),
        termGroup: 0
    };

    return new Promise(function(resolve, reject) {

        app.models.WpTerms
            .findOrCreate(createTermObj)
            .then(function(results) {
                resolve(results);
            })
            .catch(function(error) {
                console.log('there is an error! ' + error);
            });

    });
};

function populateTerm(results) {

    return new Promise(function(resolve, reject) {

        Promise.map(results, function(result) {
                return createTerm(result);
            })
            .then(function(createTermResults) {
                console.log('what are the results! ' + JSON.stringify(createTermResults));
                resolve(createTermResults);
            })
            .catch(function(error){
                console.log("there was an error! " + error);
            });

    });
};

function createTermTaxonomy(createTermResult) {

    console.log('in createTermTaxonomy input is ' + JSON.stringify(createTermResult));

    var createTermTaxonomyObj = {
        termId: createTermResult.termId,
        taxonomy: 'chembridge',
        description: '',
        parent: 0,
        count: 0,
    };

    return new Promise(function(resolve, reject) {

        if(createTermTaxonomyObj.termId){
            app.models.WpTermTaxonomy
                .findOrCreate(createTermTaxonomyObj)
                .then(function(results) {
                    resolve(results);
                })
                .catch(function(error) {
                    console.log('there is an error! ' + error);
                });
        }
        else{
            resolve();
        }

    });
};


function populateTermTaxonomy(createTermResults){

    return new Promise(function(resolve, reject) {

        Promise.map(createTermResults, function(result) {
                return createTermTaxonomy(result);
            })
            .then(function(createTermTaxonomyResults) {
                resolve(createTermTaxonomyResults);
            })
            .catch(function(error){
                console.log("there was an error! " + error);
            });

    });
};

//var pages = [];
//countChembridge()
    //.then(function(count){
        //console.log('count is ' + count);

        ////make this a function
        //for(var x=0; x<=300; x++){
            //var page = {limit: 100, skip: x};
            //pages.push(page);
        //}

    //});


queryChembridge()
    .then(function(queryChembridgeResults) {
        return populateTerm(queryChembridgeResults);
    })
    .then(function(createTermsResults) {
        return populateTermTaxonomy(createTermsResults);
    })
    .then(function(createTermTaxonomyResults){
        //console.log('final results are ' + JSON.stringify(createTermTaxonomyResults));
    });
