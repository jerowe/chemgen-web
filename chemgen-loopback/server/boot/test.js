'use strict';

module.exports = function(app) {

    //var testExports = require('./test-exports');
    var Promise = require('bluebird');

    var kue = require('kue');
    var queue = kue.createQueue();

    //queue.create('email', {
            //title: 'Account renewal required',
            //to: 'tj@learnboost.com',
            //template: 'renewal-email'
        //})
        //.events(false)
        //.priority('high')
        //.save();

    //queue.process('email', function(job, done) {
        //email(job.data.to, done);
    //});

    //function testResolves(){
        //return new Promise(function(resolve, reject){
            //console.log('in test resolve!');
        //})
    //}

    //function processEmail(){
        //return new Promise(function(resolve, reject){
            //console.log('in process email');
            //testResolves();
            //resolve();
        //});
    //}

    //function email(address, done) {
        //// email send stuff...
        //processEmail()
            //.then(function(results){
                //console.log('in email.then');
                //done();
            //})
            //.catch(function(error){

            //});
    //}
};
