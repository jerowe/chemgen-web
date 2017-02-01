var kue = require('kue');
var queue = kue.createQueue({redis: 'redis://10.230.9.222:6379'});

function cleanJobs(err, ids) {

  if (err) {
    console.log(err);
  }
  ids.forEach(function(id) {
    kue.Job.get(id, function(err, job) {
      // Your application should check if job is a stuck one
      if (err) {
        console.log(err);
      }
      job.remove(function() {
        console.log('removed ', job.id);
      });
    });
  });
}

queue.active(function(err, ids) {
  cleanJobs(err, ids);
});

queue.failed(function(err, ids) {
  cleanJobs(err, ids);
});

queue.complete(function(err, ids) {
  cleanJobs(err, ids);
});

queue.inactive(function(err, ids) {
  cleanJobs(err, ids);
});
