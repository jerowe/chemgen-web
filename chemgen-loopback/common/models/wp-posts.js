module.exports = function(WpPosts) {

    var app = require('../../server/server.js');
    var slug = require('slug');
    var kue = require('kue');
    var queue = kue.createQueue();
    var Promise = require('bluebird');

    WpPosts.ExperimentPlatePost = function(FormData, createExperimentPlateResult){

        var barcode = createExperimentPlateResult.barcode;
        var imagePath = createExperimentPlateResult.imagePath;
        var instrumentPlateId = createExperimentPlateResult.instrumentPlateId;
        var plateId = createExperimentPlateResult.id;

        var imageArray = imagePath.split('\\');
        var folder = imageArray[4];

        var well;
        var x;
        var y;
        var imageUrl;
        var assayName;
        var autoLevelJpegImage;


        var titleSlug = slug(plateId + "-" + barcode);
        titleSlug = titleSlug.toLowerCase();

        var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        var cols = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        var postContent = "<table class=\"table table-reflow\"><thead> <tr> <th>#</th>";

        for(x=0; x<cols.length; x++){
            postContent = postContent + "<th>" + cols[x] + "</th>";
        }

        postContent = postContent + "</tr></thead><tbody>";

        for(x=0; x<rows.length; x++){

            postContent = postContent + "<tr>";
            postContent = postContent + "<th scope=\"row\">" + rows[x] + "</th>";

            for(y=0; y<cols.length; y++){
                well = rows[x] + cols[y];
                assayName = barcode + "_" + well;
                autoLevelJpegImage = '/' + folder + '/'  + instrumentPlateId + '/'  + assayName + '-autolevel-300x300.jpeg';
                imageUrl = 'http://onyx.abudhabi.nyu.edu/wordpress/wp-content/uploads/assays' + autoLevelJpegImage;
                postContent = postContent +  "<td><img src=\"" + imageUrl + "\" ></td>";
            }

            postContent = postContent + "</tr>";

        }

        postContent = postContent + "</tbody></table>";


        postContent = postContent + "\n\n\n<div id=\"fotorama\" class=\"fotorama\">";
        for(x=0; x<rows.length; x++){


            for(y=0; y<cols.length; y++){
                well = rows[x] + cols[y];
                assayName = barcode + "_" + well;
                autoLevelJpegImage = '/' + folder + '/'  + instrumentPlateId + '/'  + assayName + '-autolevel-300x300.jpeg';
                imageUrl = 'http://onyx.abudhabi.nyu.edu/wordpress/wp-content/uploads/assays' + autoLevelJpegImage;

                postContent = postContent +  "<img src=\"" + imageUrl + "\" >";
            }


        }

        postContent = postContent + "</div>";

        var dateNow = new Date().toISOString();
        var postObj = {
            postAuthor: FormData.wordpress_user_id || 1,
            postType: 'plate',
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
            guid: 'http://onyx.abudhabi.nyu.edu/wordpress/' + titleSlug
        };

        WpPosts
            .create(postObj)
            .catch(function(error){
                console.log('there was an error!' + JSON.stringify(error));
            });

    };

    WpPosts.AssayProcessKue = function(data, done) {

        var FormData = data.FormData;
        var plateInfo = data.plateInfo;
        var createLibrarystockResult = data.createLibrarystockResult;
        var plateId = data.createLibrarystockResult.plateId;
        var createExperimentAssayResult = data.createExperimentAssayResult;

        //return new Promise(function(resolve, reject) {

            //var assayId = createExperimentAssayResult.assayId;
            //wordpress/chembridge/4-hydroxybenzaldehyde-2-4-methylphenyl-4-quinazolinylhydrazone/
            //This will just be the featured image
            //var postContent = "<img src=\"http://onyx.abudhabi.nyu.edu/wordpress/wp-content/uploads/" + createExperimentAssayResult.platePath + "\"><br><br><hr>";

            var postContent = "<h3>Screen Information</h3><br>";
            var plateUrl = "<a href=\"http://onyx.abudhabi.nyu.edu/wordpress/plate/" + slug(plateId + "-" + plateInfo.barcode) + "/\">" + plateInfo.barcode + "</a>";
            postContent = postContent + "<b>Plate View: </b>" + plateUrl + "<br>";
            postContent = postContent + "<b>Screen Name: </b>" + FormData.screenName + "<br>";
            postContent = postContent + "<b>Screen Temperature: </b>" + FormData.temperature + "<br>";
            postContent = postContent + "<b>Assay Type: </b>" + FormData.assay_type + "<br>";
            postContent = postContent + "<b>Library: </b>Chembridge<br>";
            postContent = postContent + "<b>Screen Stage: </b>" + FormData.screenStage + "<br>";
            postContent = postContent + "<b>Imaging Date: </b>" + plateInfo.plateStartTime + "<br>";

            if (FormData.junk === 1) {
                postContent = postContent + "<b>Junk: </b>" + "Yes<br>";
            } else {
                postContent = postContent + "<b>Junk: </b>" + "No<br>";
            }

            //add all taxonomy terms here
            //FormData tags
            postContent = postContent + "<h2>Tags</h2>";
            var taxTerm = createLibrarystockResult.taxTerm;
            var taxTermUrl = "<a href=\"http://onyx.abudhabi.nyu.edu/wordpress/chembridge/" + slug(taxTerm) + "/\">" + taxTerm + "</a>";

            postContent = postContent + "<b>Term: </b>" + taxTermUrl + "<br>";

            var dateNow = new Date().toISOString();
            var titleSlug = slug(createExperimentAssayResult.assayName);

            //Change Title String
            titleSlug =  createExperimentAssayResult.assayId + '-' + titleSlug;
            titleSlug = titleSlug.toLowerCase();

            var postObj = {
                postAuthor: FormData.wordpress_user_id || 1,
                postType: 'assay',
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
                guid: 'http://onyx.abudhabi.nyu.edu/wordpress/' + titleSlug
            };

            WpPosts
                .create(postObj)
                .then(function(result) {
                    app.models.WpTerms.kue(FormData, plateInfo, createLibrarystockResult, result);
                    return WpPosts.assayImagePost(FormData, plateInfo, createLibrarystockResult, createExperimentAssayResult.platePath, titleSlug, result);
                })
                .then(function(){
                    done();
                })
                .catch(function(error) {
                    console.log('we have an error ' + error);
                    return done(new Error(error));
                });
        //});

    };

    WpPosts.assayImagePost = function(FormData, plateInfo, createLibrarystockResult, imagePath, titleSlug, assayPostResult) {

        return new Promise(function(resolve, reject){

            var dateNow = new Date().toISOString();
            var postObj = {
                postAuthor: FormData.wordpress_user_id || 1,
                postType: 'attachment',
                postMimeType: 'image/jpeg',
                commentCount: 0,
                menuOrder: 0,
                postContent: '',
                postStatus: 'inherit',
                postTitle: assayPostResult.postTitle + '.jpeg',
                postName: titleSlug,
                postParent: 0,
                pingStatus: 'closed',
                commentStatus: 'open',
                postDate: dateNow,
                postDateGmt: dateNow,
                guid: 'http://onyx.abudhabi.nyu.edu/wordpress/wp-content/uploads/' + imagePath
            };

            WpPosts
                .create(postObj)
                .then(function(result) {
                    //resolve(annotationExperimentAssay(plateInfo, well, createLibrarystockResult, createExperimentAssayResult, result));
                    //resolve(result);
                    //WpTerms.kue = function(FormData, plateInfo, createLibrarystockResult, createPostResult) {
                    app.models.WpTerms.kue(FormData, plateInfo, createLibrarystockResult, result);

                    var createObjs = [{
                        postId: assayPostResult.id,
                        metaKey: '_thumbnail_id',
                        metaValue: result.id
                    },
                    {
                        postId: result.id,
                        metaKey: '_wp_attached_file',
                        metaValue: imagePath
                    }];

                    app.models.WpPostmeta.assayImageMeta(createObjs);

                })
                .then(function(){
                    resolve();
                })
                .catch(function(error) {
                    console.log('we have an error ' + error);
                    reject(error);
                });

        });
    };

    WpPosts.assayPostKue = function(FormData, plateInfo, createLibrarystockResult, createExperimentAssayResult) {

        return new Promise(function(resolve){

            var queueObj = {
                title: 'ExperimentAssayPost-' + plateInfo.experimentPlateId + '-' + plateInfo.barcode + '-' + createLibrarystockResult.well,
                FormData: FormData,
                plateInfo: plateInfo,
                createLibrarystockResult: createLibrarystockResult,
                createExperimentAssayResult: createExperimentAssayResult
            };

            queue.create('createExperimentAssayPost', queueObj)
                .events(false)
                .priority('high')
                .save();

            queue.process('createExperimentAssayPost', 1, function(job, done) {
                WpPosts.AssayProcessKue(job.data, done);
                resolve();
            });

        });
    };

};
