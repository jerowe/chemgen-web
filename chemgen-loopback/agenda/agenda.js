var Agenda = require('agenda');
var mongoConnectionString = "mongodb://admin:admin123@10.230.9.222/agenda";

var agenda = new Agenda({
  db: {
    address: mongoConnectionString,
  }
});


agenda.on('start', function(job) {
  console.log("Job %s starting", job.attrs.name);
});

agenda.on('error', function(error) {
  console.log('We got an error! ' + JSON.stringify(error));
});

require('./jobs/jobs.js')(agenda);

agenda.on('ready', function() {
  // agenda.purge(function(error, numRemoved) {
  //   if (error) {
  //     console.log('there was an error! ' + error);
  //   } else {
  //     console.log('num removed ' + numRemoved);
  //   }
  // });

  agenda.processEvery('5 seconds');
  agenda.maxConcurrency(10);
  agenda.defaultConcurrency(1);
  agenda.start();
  console.log('agenda has started...');
});

function graceful() {
  agenda.stop(function() {
    process.exit(0);
  });
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

module.exports = agenda;
