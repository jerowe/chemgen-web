'use strict';

module.exports = function(app) {

    var Promise = require('bluebird');
    var FormData = {};

    function populateExperimentPlate(plateListResults) {

        return new Promise(function(resolve) {
            Promise.map(plateListResults, function(plateInfo) {
                app.models.ExperimentExperimentplate
                    .kue({
                        FormData: FormData,
                        plateInfo: plateInfo
                    });
            });
            resolve();
        });
    }

    function preProcessPlateList(plates) {

        return new Promise(function(resolve, reject) {

            Promise.map(plates, function(plate) {
                    return app.models.Plate.getList(plate);
                })
                .then(function(plateListResults) {
                    return populateExperimentPlate(plateListResults[0]);
                })
                .then(function() {
                    resolve();
                })
                .catch(function(error) {
                    console.log('there was an error! ' + error);
                    reject(error);
                });
        });

    }

    app.post('/getPlateList', function(req, res) {
        FormData = req.body.FormData;

        preProcessPlateList(FormData.plates)
            .then(function() {
                res.send('ok!');
            })
            .catch(function(error) {
                res.status(500).send(error);
            });

    });

};

//var fs = require('fs');
//var slug = require('slug');
//var FormData = {};

//function createExperimentAssay(plateInfo, well, createChemicalLibrarystockResult, createExperimentAssayObj) {

//return new Promise(function(resolve, reject) {

//app.models.ExperimentAssay
//.create(createExperimentAssayObj)
//.then(function(result) {
//resolve(createExperimentAssayPost(plateInfo, well, createChemicalLibrarystockResult, result));
//})
//.catch(function(error) {
//reject(error);
//console.log('there was an error! ' + error);
//});
//});
//}

////This is the image path for only apache
//function getImagePath(plateInfo, well) {

//var imageArray = plateInfo.imagePath.split('\\');
//var folder = imageArray[4];
//var imageId = imageArray[5];

//var autoLevelJpegImage = '/' + folder + '/' + imageId + '/' + imageId + '_' + well + '-autolevel.jpeg';

//return [autoLevelJpegImage, folder, imageId];
//}

//function convertImages(plateInfo, well) {

//return new Promise(function(resolve) {

//var imageArray = plateInfo.imagePath.split('\\');
//var folder = imageArray[4];
//var imageId = imageArray[5];

//var imagePath = '/mnt/Plate_Data/' + folder + '/' + imageId + '/' + imageId;
//var ext = "f00d0.C01";

//var vendorImage = imagePath + '_' + well + ext;

//var makeDir = '/var/data/convert/' + folder + '/' + imageId;

//var convertImage = '/var/data/convert/' + folder + '/' + imageId + '/' + imageId + '_' + well + '.tiff';
//var autoLevelTiffImage = '/var/data/convert/' + folder + '/' + imageId + '/' + imageId + '_' + well + '-autolevel.tiff';
//var autoLevelJpegImage = '/var/data/convert/' + folder + '/' + imageId + '/' + imageId + '_' + well + '-autolevel.jpeg';

//var commands = [];

////console.log('testing for image ' + autoLevelJpegImage);
////try {
////fs.accessSync(autoLevelJpegImage);
//////console.log('image does exist!' + autoLevelJpegImage);
////} catch (e) {
//////console.log('image does nto exist!' + autoLevelJpegImage);
////commands.push('mkdir -p ' + makeDir);
////commands.push('/var/data/bftools/bfconvert -overwrite ' + vendorImage + ' ' + convertImage);
////commands.push('convert -auto-level ' + convertImage + ' ' + autoLevelTiffImage);
////commands.push('convert -layers flatten -quality 100 ' + autoLevelTiffImage + ' ' + autoLevelJpegImage);
////commands.push('rm -rf ' + convertImage);
////commands.push('rm -rf ' + autoLevelTiffImage);
////}

//fs.access(autoLevelJpegImage, function(err) {

//if (err && err.code === 'ENOENT') {
//commands.push('mkdir -p ' + makeDir);
//commands.push('/var/data/bftools/bfconvert -overwrite ' + vendorImage + ' ' + convertImage);
//commands.push('convert -auto-level ' + convertImage + ' ' + autoLevelTiffImage);
//commands.push('convert -layers flatten -quality 100 ' + autoLevelTiffImage + ' ' + autoLevelJpegImage);
//commands.push('rm -rf ' + convertImage);
//commands.push('rm -rf ' + autoLevelTiffImage);

//}

//});

//if (!commands[0]) {
//return;
//}

////var imageJob = {
////title: 'convertImage',
////commands: commands,
////};

////We are moving this over to the centos server
////request.post(
////'http://onyx.abudhabi.nyu.edu:3001/', {
////json: imageJob
////},
////function(error, response, body) {

////if (!error && response.statusCode == 200) {
//////everything is gooe
////} else {
//////console.log('there was an error submitting jobs');
////}
////}
////);
//resolve(commands);
//});
//}

//function annotateExperimentAssay(plateInfo, createExperimentAssayResults){
//function annotationExperimentAssay(plateInfo, well, createChemicalLibrarystockResult, createExperimentAssayResult, createExperimentAssayPostResult) {

////console.log('create chemical library stock result ' + JSON.stringify(createChemicalLibrarystockResult));

//return new Promise(function(resolve, reject) {

//var createTerms = [{
//taxonomy: 'chembridge',
//taxTerm: createChemicalLibrarystockResult.taxTerm
//}, {
//taxonomy: 'screen',
//taxTerm: FormData.screenName
//}, {
//taxonomy: 'barcode',
//taxTerm: plateInfo.barcode,
//}, {
//taxonomy: 'worm_strain',
//taxTerm: 'N2'
//}];

//var postId = createExperimentAssayPostResult.id;

//Promise.map(createTerms, function(createTermObj) {

//if (!createTermObj.taxTerm) {
//createTermObj.taxTerm = createTermObj.taxonomy + '_empty';
//}

//resolve(createTerm(postId, createTermObj.taxTerm, createTermObj.taxonomy));
////.then(function(createTermResults) {
////})
////.then(function(createTermTaxonomyResults) {
////return createTermRelationships(createTermTaxonomyResults);
////})

//});

//});

//};

//function createExperimentAssayPost(plateInfo, well, createChemicalLibrarystockResult, createExperimentAssayResult) {

//console.log('we are creating a new ExperimentAssayPost ' + createExperimentAssayResult.assayName);

//return new Promise(function(resolve, reject) {

//var assayId = createExperimentAssayResult.assayId;
//var postContent = "<img src=\"" + createExperimentAssayResult.platePath + "\"><br><br><hr>";
//postContent = postContent + "<h3>Screen Information</h3><br>";
//postContent = postContent + "<b>Screen Name: </b>" + FormData.screenName + "<br>";
//postContent = postContent + "<b>Screen Temperature: </b>" + FormData.temperature + "<br>";
//postContent = postContent + "<b>Assay Type: </b>" + FormData.assay_type + "<br>";
//postContent = postContent + "<b>Screen Stage: </b>" + FormData.screenStage + "<br>";
//postContent = postContent + "<b>Imaging Date: </b>" + plateInfo.plateStartTime + "<br>";

//if (FormData.junk == 1) {
//postContent = postContent + "<b>Junk: </b>" + "Yes<br>";
//} else {
//postContent = postContent + "<b>Junk: </b>" + "No<br>";
//}

//var dateNow = new Date().toISOString();
//var titleSlug = slug(createExperimentAssayResult.assayName);
////titleSlug = newDate + '-' + plateInfo.instrumentPlateId + '-' + titleSlug;

//var postObj = {
//postAuthor: FormData.wordpress_user_id || 1,
//postType: 'assay',
//commentCount: 0,
//menuOrder: 0,
//postContent: postContent,
//postStatus: 'publish',
//postTitle: createExperimentAssayResult.assayName,
//postName: titleSlug,
//postParent: 0,
//pingStatus: 'open',
//commentStatus: 'open',
//postDate: dateNow,
//postDateGmt: dateNow,
//guid: 'http://onyx.abudhabi.nyu.edu/wordpress/' + titleSlug
//};

//app.models.WpPosts
//.create(postObj)
//.then(function(result) {
//resolve(annotationExperimentAssay(plateInfo, well, createChemicalLibrarystockResult, createExperimentAssayResult, result));
////resolve(result);
//})
//.catch(function(error) {
//console.log('we have an error ' + error);
//});

////});

//});
//}

//function createTerm(postId, taxTerm, taxonomy) {

//return new Promise(function(resolve, reject) {

//var createTermObj = {
//name: taxTerm,
//slug: slug(taxTerm),
//termGroup: 0
//};

//app.models.WpTerms
//.findOrCreate({
//where: createTermObj
//}, createTermObj)
//.then(function(results) {
//var result = results[0];
//result.postId = postId;
//result.taxonomy = taxonomy;
//resolve(createTermTaxonomy(result));
//})
//.catch(function(error) {
//console.log('there is an error! ' + JSON.stringify(error));
//reject(error);
//});
//});
//};

//function createTermTaxonomy(createTermResult) {

////console.log('in createTermTaxonomy ' + JSON.stringify(createTermResult));

//return new Promise(function(resolve, reject) {

//var createTermTaxonomyObj = {
//termId: createTermResult.termId,
//taxonomy: createTermResult.taxonomy,
//description: '',
//parent: 0,
//count: 1,
//};

//app.models.WpTermTaxonomy
//.findOrCreate({
//where: createTermTaxonomyObj
//}, createTermTaxonomyObj)
//.then(function(results) {
//var result = results[0];
//result.postId = createTermResult.postId;
////console.log('ok we created a termtaxonomy ' +JSON.stringify(result) );
//resolve(createTermRelationships(result));
//})
//.catch(function(error) {
//console.log('creating term taxonomy there is an error! ' + error);
//});

//});
//};

//function createTermRelationships(createTermTaxonomyResult) {

////console.log('in createTermRelationships ' + JSON.stringify(createTermTaxonomyResult));

//return new Promise(function(resolve, reject) {

//var createTermObj = {
//termTaxonomyId: createTermTaxonomyResult.termTaxonomyId,
//termOrder: 0,
//objectId: createTermTaxonomyResult.postId
//};

//app.models.WpTermRelationships
//.findOrCreate({
//where: createTermObj
//}, createTermObj)
//.then(function(results) {
//var result = results[0];
//resolve(result);
//})
//.catch(function(error) {
//console.log('creating term relationship there is an error! ' + JSON.stringify(error));
//});

//});
//};


//function populateExperimentAssay(plateInfo, well, createChemicalLibrarystockResults) {

//return new Promise(function(resolve, reject) {

//Promise.map(createChemicalLibrarystockResults, function(createChemicalLibrarystockResult) {

//var image = getImagePath(plateInfo, well);

//var createExperimentAssayObj = {
//plateId: plateInfo.experimentPlateId,
//assayName: plateInfo.barcode + "_" + well,
//well: well,
//biosampleId: 1,
//reagentId: createChemicalLibrarystockResult.librarystockId,
//isJunk: FormData.junk,
//platePath: '/images' + image[0],
//metaAssay: JSON.stringify({
//reagentType: 'chemical',
//experimentType: 'organism',
//library: 'chembridge'
//}),
//assayType: 'chemical',
//};
//return createExperimentAssay(plateInfo, well, createChemicalLibrarystockResult, createExperimentAssayObj);
//})
//.then(function() {
//return convertImages(plateInfo, well);
//})
//.catch(function(error) {
//console.log('HERE there was an error!' + JSON.stringify(error));
//reject(error);

//});

//resolve();
//});

//};
