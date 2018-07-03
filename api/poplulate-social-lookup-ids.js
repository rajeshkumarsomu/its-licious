const sourceData = require('./../src/assets/data/summerlicious-2018.json');
const fs = require('fs');
const axios = require('axios');

const yelp = require('./yelp-api');
const google = require('./google-api');
const fileNameToWrite = './../src/assets/data/summerlicious-2018.json';

const throttledQueue = require('throttled-queue');

try {
  var throttle = throttledQueue(2, 1000); // at most 5 requests per second.
  let promisesArray = [];
  let count = 0;
  for (let r of sourceData.restaurants) {
    throttle(() => {
      count++;
      promisesArray.push(yelp.lookupYelpIdByParams(r));
      promisesArray.push(google.getGooglePlaceIdByParams(r));
      if (count === sourceData.restaurants.length) {
        Promise.all(promisesArray).then(() => {
          writeToFile(sourceData);
        }).catch(function(err) {
          console.error(err);
        });
      }
    });
  }
}
catch(ex) {
  console.error(ex);
}

function writeToFile(r) {
  console.log('write to file');
  fs.writeFile(fileNameToWrite, JSON.stringify(r), function(err) {
    if (err) console.error(err);
    else console.log('finished writing to file');
    return;
  });
}
