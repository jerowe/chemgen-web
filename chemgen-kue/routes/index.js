var express = require('express');
var router = express.Router();

var Promise = require('bluebird');

var mkdirp = Promise.promisify(require("mkdirp"));
var writeFile = Promise.promisify(require("fs").writeFile);

function convertImageJob(job) {

    //var filePath = '/mnt/image/queue/wait';
    var filePath = '/home/jdr400/projects/chemgen-kue/queue/wait/';

    return new Promise(function(resolve, reject) {

        mkdirp(filePath)
            .then(function() {
                return writeFile(filePath + job.title, job.commands.join("\n"));
            })
            .then(function(){
                resolve();
            })
            .catch(function(error) {
                console.log('there was an error! ' + error);
                reject(error);
            });
    });

}

router.post('/', function(req, res) {

    console.log('req.body is ' + JSON.stringify(req.body));

    convertImageJob(req.body)
        .then(function() {
            res.send('ok');
        })
        .catch(function(error) {
            res.status(500).send(error);
        });

});


module.exports = router;
