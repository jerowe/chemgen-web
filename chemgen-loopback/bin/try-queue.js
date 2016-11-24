module.paths.push('/usr/local/lib/node_modules');

var kue = require('kue');
var queue = kue.createQueue({});

function hello(address, done) {
    done();
}

var email = queue.create('email', {
    title: 'Account renewal required'
        , to: 'tj@learnboost.com'
        , template: 'renewal-email'
}).save();

queue.process('email', function(job, done){
  hello(job.data.to, done);
});
