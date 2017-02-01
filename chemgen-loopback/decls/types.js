/* @flow */
'use strict';

var app = require('../server/server');

/*::
type FormData = {
  screenId: number,
  screenName: string,
  screenStage: number,
  libraryId: number,
  libraryName: string,
  junk: number,
  instrumentName: string,
  temperature: string,
  date: string,
  plates: Array<Object>,
  wpUI?: number,
  wpAT?: string,
};
*/

/*::
type plateInfo = {
  experimentPlateId: number,
  barcode: string,
  instrumentId: number,
  instrumentPlateId: number,
  screenId: number,
  screenStage: number,
  temperature: string,
  title: string,
  imagePath: string,
  plateStartTime: string,
};
*/

/*::
type vendorPlateInfo = {
  plateStartTime: string,
  csPlateid: number,
  barcode: string,
  imagePath: string,
};
*/

/*::
type postObj = {
  postAuthor: number,
  postType: string,
  commentCount: number,
  menuOrder: number,
  postContent: string,
  postStatus: string,
  postTitle: string,
  postName: string,
  postParent: number,
  pingStatus: string,
  commentStatus: string,
  postDate: string,
  postDateGmt: string,
  guid: string,
};
*/
