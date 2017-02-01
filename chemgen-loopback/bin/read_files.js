//This is going to do some of the WORM etl
'use strict';

var app = require('../server/server.js');

var file = '/home/jdr400/wormbase_ftp_resources/c_elegans.PRJNA13758.WS250.functional_descriptions.txt'
var lineReader = require('readline').createInterface({input: require('fs').createReadStream(file)});

lineReader.on('line', function(line) {
  console.log('Line from file:', line);
  var things = line.split('\t');
  console.log(JSON.stringify(things));
  return;
});

function createPost() {
  var postContent = '';
  var titleSlug = '';

  var dateNow = new Date().toISOString();
  var postObj/*: postObj */ = {
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
    guid: wpUrl + '/wordpress/' + titleSlug
  };
}
