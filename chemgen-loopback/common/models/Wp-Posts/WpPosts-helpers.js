'use strict';

var postInfo = function(FormData, plateInfo) {
  var postContent /*: string */ = '';

  postContent = postContent +
    '<b>Screen Name: </b>' + FormData.screenName + '<br>';
  postContent = postContent +
    '<b>Screen Temperature: </b>' + FormData.temperature + '<br>';
  postContent = postContent + '<b>Library: </b>Chembridge<br>';
  postContent = postContent + '<b>Screen Stage: </b>' +
    FormData.screenStage + '<br>';
  postContent = postContent + '<b>Imaging Date: </b>' +
    plateInfo.plateStartTime + '<br>';

  //TODO add in taxonomies
  if (FormData.junk === 1) {
    postContent = postContent + '<b>Junk: </b>' + 'Junk<br>';
  } else {
    postContent = postContent + '<b>Junk: </b>' + 'Not Junk<br>';
  }

  return postContent;
};

module.exports = {
  postInfo: postInfo,
};
