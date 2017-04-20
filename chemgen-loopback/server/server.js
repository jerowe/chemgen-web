'use strict';

var bodyParser = require('body-parser');
var boot = require('loopback-boot');
var loopback = require('loopback');
const process = require('process');

var app = module.exports = loopback();

//Replacing Kue with Agenda
// var agenda = require('./boot/agendaWorker.js');
var agenda = require('../agenda/worker.js');
app.agenda = agenda;

// TODO - get rid of all queue
// var kue = require('kue');
// app.queue = kue.createQueue({
//   redis: 'redis://10.230.9.222:6379'
// });
app.queue = {};


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
}));

app.start = function() {
  // start the web server

  return app.listen(function() {
    // app.queue.watchStuckJobs();

    //Kue Shutdown
    process.once('SIGTERM', function(sig) {
      queue.shutdown(5000, function(err) {
        console.log('Kue shutdown: ', err || '');
        process.exit(0);
      });
    });

    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err)
    throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
