var path = require('path');
var Promise = require('bluebird');
var fs = require('fs');
var loopback = require('loopback');

var app = require(path.resolve(__dirname, '../server/server'));
var datasource = app.datasources.chemgenDS;
var outputPath = path.resolve(__dirname, '_models');

var modelConfig = {};

//datasource.discoverModelDefinitions(function (err, models) {
//models.forEach(function (def) {
//// def.name ~ the model name
//datasource.discoverSchema(def.name, null, function (err, results) {
////console.log(schema);
//table = def.name;
//modelConfig[table] = {'datasource': 'chemgenDS'};

//table = table.replace(/_/g, "-");

//var outputFile = outputPath + "/" + table + ".json"

//console.log("Output file" + outputFile);
//var json = JSON.stringify(results, null, '  ');

//fs.writeFile(outputFile, JSON.stringify(results, null, 2), function(err) {
//if(err) {
//console.log(err);
//} else {
//console.log("JSON saved to " + outputFile);
//}
//});
//});

//});
//var json = JSON.stringify(modelConfig, null, '  ');
//console.log(json);
//datasource.disconnect();
//});

var discover_models = function() {

    return new Promise(function(resolve, reject) {
        datasource.discoverModelDefinitions()
            .then(function(models) {
                resolve(models);
            })
            .catch(function(error) {
                reject(error);
            });
    });
};

var discover_schema = function(models) {

    models.forEach(function(model) {


        table  = model.name;
        console.log('Table is ' + table);

        return new Promise(function(resolve, reject) {

            datasource.discoverSchema(table)
                .then(function(results) {
                    console.log('discovering schema');
                    table = table.replace(/_/g, "-");

                    var outputFile = outputPath + "/" + table + ".json"

                    console.log("Output file" + outputFile);
                    var json = JSON.stringify(results, null, '  ');

                    fs.writeFile(outputFile, JSON.stringify(results, null, 2), function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("JSON saved to " + outputFile);
                        }
                    });

                    resolve(results);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    });
};

discover_models()
    .then(function(models) {
        discover_schema(models);
    })
    .then(function(){
        //datasource.disconnect();
        resolve();
    })
    .catch(function(error) {

    });
