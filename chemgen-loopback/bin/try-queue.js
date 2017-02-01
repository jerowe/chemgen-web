var kue = require('kue');
var queue = kue.createQueue({redis: 'redis://10.230.9.222:6379'});

function hello(address, done) {
  done();
}

var email = queue.create('email', {
  title: 'Account renewal required',
  to: 'tj@learnboost.com',
  template: 'renewal-email'
}).save();

queue.process('email', function(job, done) {
  hello(job.data.to, done);
});
// var app;
// var kue = require('kue');
// var redis = require('kue/lib/redis');
//
// app.redisClient =  redis.createClient(6379, 'redis://10.230.9.222', {});
//
// app.redisClient.on('connect', function () {
//     console.info('successful connection to redis server');
// });
//
// app.redisClient.on('error', function (err) {
//     console.log('Redis error encountered', err);
// });
//
// app.redisClient.on('end', function() {
//     console.log('Redis connection closed');
// });
//
// kue.app.listen(config.kuePort);
//
// app.jobs = kue.createQueue({
//     redis: {
//         createClientFactory: function(){
//             return app.redisClient;
//         }
//     }
// });
