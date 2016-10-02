var path = require('path');

var app = require(path.resolve(__dirname, '../server/server'));
var ds = app.dataSources.arrayscan;

ds.discoverAndBuildModels('Plate', {schema: 'public'}, function(err, models) {
  if (err) throw err;

  models.Plate.find(function(err, accounts) {
    if (err) return console.log(err);

    console.log(accounts);

    ds.disconnect();
  });
});
