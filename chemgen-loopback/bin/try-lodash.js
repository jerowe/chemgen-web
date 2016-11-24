var _ = require('lodash');


var testArray = [{key: 'value'}, {key: 'newvalue', someotherkey: 'someotherval'}];
var myFound = _.find(testArray, 'key', 'newvalue');

console.log('myfound is ' + JSON.stringify(myFound));
