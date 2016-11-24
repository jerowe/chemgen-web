var fs = require('fs');
var Promise = require('bluebird');

var myDir = '/var/t';

try {
      fs.accessSync(myDir);

} catch (e) {

    console.log('it doesnt exist');
}
