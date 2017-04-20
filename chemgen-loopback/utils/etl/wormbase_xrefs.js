//This is going to do some of the WORM etl
'use strict';

var app = require('../../server/server.js');
var helpers = require('../../common/models/helpers');
var wpUrl = helpers.wpUrl();
var Promise = require('bluebird');
var postHelper = require('./post_helper.js');
var sleep = require('sleep');

// process.setMaxListeners(0);
// require('events').EventEmitter.prototype._maxListeners = 100;
var file = '/home/jdr400/wormbase_ftp_resources/c_elegans.PRJNA13758.WS250.xrefs.txt';
// var file = '/home/jdr400/wormbase_ftp_resources/xref/xaa';
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(file)
});

// Our Taxonomy Terms
// Gene ID: WBGene0000001
// Cosmid ID: aap-1
// SequenceID: Y110A7A.10

// 1. Wormbase Gene Sequence Name - 2L52.1
// 2. WormBase Gene Accession - WBGene0000001
//         URL - http://www.wormbase.org/species/c_elegans/gene/WBGene00007063
// 3. WormBase Gene CGC name
// 4. WormBase Transcript sequence Name - 2L252.1b
//         URL - http://www.wormbase.org/species/c_elegans/transcript/2L52.1a
// 5. WormPep protein Accession - CE50559
//         URL - http://www.wormbase.org/species/c_elegans/protein/WP:CE50559
// 6. INSDC parent sequence name - BX284602
// 7. INSDC locus_tag id - CELE*
// 8. INSDC protein_id - CTQ*
// 9. UniProt Accession - A4F336

// Post ID - wb_xref
// We need the protein accession for blast

lineReader.on('line', function(line) {
  lineReader.pause();
  var things = line.split('\t');
  var commentRe = new RegExp('^//');

  if (commentRe.test(things[0])) {

    return;
  }

  //TODO add in an additional check for '.'
  var createTermObjs = [];
  if (checkTermKey(things[0])) {
    // variable is undefined or null
    createTermObjs.push({
      taxonomy: 'wb_sequence_id',
      taxTerm: things[0]
    });
  }
  if (checkTermKey(things[1])) {
    // variable is undefined or null
    createTermObjs.push({
      taxonomy: 'wb_gene_id',
      taxTerm: things[1]
    });
  }
  if (checkTermKey(things[4])) {
    // variable is undefined or null
    createTermObjs.push({
      taxonomy: 'wb_protein_accession',
      taxTerm: things[4]
    });
  }

  var wpGeneUrl = [
    "<a href=\"",
    wpUrl,
    "/wb-fn-desc/",
    things[1],
    "\">",
    "Internal ",
    things[1],
    "</a>"
  ].join('');

  var geneUrl = [
    "<a href=\"",
    "http://www.wormbase.org/species/c_elegans/gene/",
    things[1],
    "\">",
    "Wormbase ",
    things[1],
    "</a>"
  ].join('');

  var wormPepUrl = [
    "<a href=\"",
    "http://www.wormbase.org/species/c_elegans/protein/WP:",
    things[4],
    "\">",
    "WormPep ",
    things[4],
    "</a>"
  ].join('');

  var unitProt = [
    "<a href=\"",
    "http://www.uniprot.org/uniprot/",
    things[8],
    "\">",
    things[8],
    "</a>"
  ].join('');

  var transcriptUrl = [
    "<a href=\"",
    "http://www.wormbase.org/species/c_elegans/transcript/",
    things[3],
    "\">",
    things[3],
    "</a>"
  ].join('');

  var postContent = [
    '<h2>XRefs</h2><br>These are cross references to other databases<br>',
    '<h3>Gene ID</h3><br>',
    wpGeneUrl,
    '<br>',
    geneUrl,
    '<br>',
    '<h3>Sequence ID</h3><br>',
    things[0],
    '<br><h3>WormBase CGC Name</h3><br>',
    things[2],
    '<br><h3>WormBase Transcript ID</h3><br>',
    transcriptUrl,
    '<br><h3>WormPep Protein Accession</h3><br>',
    wormPepUrl,
    '<br><h3>INSDC Parent Sequence Name</h3><br>',
    things[5],
    '<br><h3>INSDC Locus Tag ID</h3><br>',
    things[6],
    '<br><h3>INSDC Protein ID</h3><br>',
    things[7],
    '<br><h3>UniProt Accession</h3><br>',
    things[8]
  ].join("\n");

  createPost(postContent, things[1], createTermObjs)
    .then(function(results) {
      lineReader.resume();
    })
    .catch(function(error) {
      // console.error('We got an error ! ' + JSON.stringify(error));
    });
});


function checkTermKey(termKey) {

  var re = new RegExp('^\.$');
  if (typeof termKey !== 'undefined' || termKey !== null || re.test(termKey)) {
    return false;
  } else {
    return true;
  }
}

// lineReader.on('close', function() {
//   process.exit(0);
// });

function createPost(postContent, titleSlug, createTermObjs) {

  var posts = postHelper.createPost('wb_xref', postContent, titleSlug);

  return new Promise(function(resolve, reject) {

    if (typeof titleSlug === 'undefined' || titleSlug === null) {
      console.log('No title slug..');
      resolve();
    } else {
      app.models.WpPosts
        .findOrCreate({
          where: posts[0]
        }, posts[1])
        .then(function(results) {
          return app.models.WpTerms.preProcessKue({
            postId: results[0].id,
            createTerms: createTermObjs
          });
        })
        .then(function(results) {
          return app.models.WpTerms.postProcess(results);
        })
        .then(function(results) {
          console.log('successfully created post!');
          resolve();
        })
        .catch(function(error) {
          reject(new Error(error));
        });
    }

  });
}
