//This is going to do some of the WORM etl
'use strict';

var app = require('../server/server.js');
var helpers = require('../common/models/helpers');
var wpUrl = helpers.wpUrl();
var Promise = require('bluebird');
var readline = require('linebyline');

// gene_id
// public_name
// molecular_name
// concise_description
// provisional_description
// detailed_description
// automated_description
// gene_class_description
// Gene ID: WBGene0000001
// Cosmid ID: aap-1
// SequenceID: Y110A7A.10

//Create Post, create Taxonomy

var file = '/home/jdr400/wormbase_ftp_resources/c_elegans.PRJNA13758.WS250.functional_descriptions.txt';
var lineReader = readline(file);
// var lineReader = require('readline').createInterface({
//   input: require('fs').createReadStream(file)
// });

lineReader.on('line', function(line) {
  // console.log('Line from file:', line);
  var things = line.split('\t');
  var commentRe = new RegExp('^#');
  var geneIdRe = new RegExp('^gene_id');
  // console.log(JSON.stringify(things));
  if (commentRe.test(things[0])) {
    return;
  } else if (geneIdRe.test(things[0])) {
    return;
  }

  var postContent = "";
  postContent = "<b>Gene ID</b><br>\n" + things[0] + "<br><br>";
  postContent = postContent + "<b>Public Name</b><br>\n" + things[1] + "<br><br>";
  postContent = postContent + "<b>Molecular Name</b><br>\n" + things[2] + "<br><br>";
  postContent = postContent + "<b>Concise Description</b><br>\n" + things[3] + "<br><br>";
  postContent = postContent + "<b>Provisional Description</b><br>\n" + things[4] + "<br><br>";
  postContent = postContent + "<b>Detailed Description</b><br>\n" + things[5] + "<br><br>";
  postContent = postContent + "<b>Automated Description</b><br>\n" + things[6] + "<br><br>";
  postContent = postContent + "<b>Gene Class Description</b><br>\n" + things[7] + "<br><br>";

  var createTermObjs = [
    {
      taxonomy: 'wb_cosmid_id',
      taxTerm: things[1]
    }, {
      taxonomy: 'wb_gene_id',
      taxTerm: things[0]
    }, {
      taxonomy: 'wb_sequence_id',
      taxTerm: things[2]
    }
  ];

  createPost(postContent, things[0], createTermObjs)
});

function createPost(postContent, titleSlug, createTermObjs) {

  var dateNow = new Date().toISOString();
  //TODO the url should come from helpers
  var postObj = {
    postAuthor: 1,
    postType: 'wb_fn_desc',
    commentCount: 0,
    menuOrder: 0,
    postContent: postContent,
    postStatus: 'publish',
    postTitle: titleSlug,
    postName: titleSlug,
    postParent: 0,
    pingStatus: 'open',
    commentStatus: 'open',
    guid: wpUrl + titleSlug
  };

  var postObjWithDate = {
    postAuthor: 1,
    postType: 'wb_fn_desc',
    commentCount: 0,
    menuOrder: 0,
    postContent: postContent,
    postStatus: 'publish',
    postTitle: titleSlug,
    postName: titleSlug,
    postParent: 0,
    pingStatus: 'open',
    commentStatus: 'open',
    postDate: dateNow,
    postDateGmt: dateNow,
    guid: wpUrl + titleSlug
  };

  app.models.WpPosts
    .findOrCreate({
      where: postObj
    }, postObjWithDate)
    .then(function(results) {
      return app.models.WpTerms
        .preProcessKue({
          postId: results[0].id,
          createTerms: createTermObjs,
        });
    })
    .then(function(results) {
      console.log('done');
    })
    .catch(function(error) {
      reject(new Error(error));
    });

}
