var path = require('path');
var Promise = require('bluebird');
var fs = require('fs');

var app = require(path.resolve(__dirname, '../server/server'));
var ds = app.datasources.arrayscan;
var outputPath = path.resolve(__dirname, '_models');

var tables = ['Plate']

var discovar = function(table){
    return new Promise(function(resolve, reject){

        ds.discoverSchema(table, {schema: 'public'})
            .then(function(results){

                table = table.replace(/_/g, "-");

                var outputFile = outputPath + "/" + table + ".json"

                console.log("Output file" + outputFile);
                var json = JSON.stringify(results, null, '  ');

                fs.writeFile(outputFile, JSON.stringify(results, null, 2), function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("JSON saved to " + outputFile);
                    }
                });

                resolve(results);
                ds.disconnect();
            })
            .catch(function(error){
                reject(error);
            });
    });
};

for (i = 0; i < tables.length; i++) {
    var table = tables[i];

    console.log("table is " + table);
    discovar(table);
}
