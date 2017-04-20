'use strict';

var helpers = require('../../common/models/helpers');
var wpUrl = helpers.wpUrl();

exports.createPost = function(postType, postContent, titleSlug) {

  var dateNow = new Date().toISOString();
  //TODO the url should come from helpers
  var postObj = {
    postAuthor: 1,
    postType: postType,
    commentCount: 0,
    menuOrder: 0,
    postContent: postContent,
    postStatus: 'publish',
    postTitle: titleSlug,
    postName: titleSlug,
    postParent: 0,
    pingStatus: 'open',
    commentStatus: 'open',
    guid: wpUrl + '/' + postType + '/' + titleSlug
  };

  var postObjWithDate = {
    postAuthor: 1,
    postType: postType,
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
    guid: wpUrl + '/' + postType + '/' + titleSlug
  };

  return [postObj, postObjWithDate];
}
