var Promise = require('bluebird');

var things = [1,2,3,4];

Promise.map(things, function(val, index){
  console.log('val is ' + val);
  console.log('index is ' + index);
});
