var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
var turf = require('turf');
var fs = require('fs');
var d3 = require('d3');

var NUM_SEGMENTS = 30;

function getBuses() {
  // console.log("Inside getBuses()");
  var buses = [];
  return new Promise((resolve, reject) => {
    var requestSettings = {
      method: 'GET',
      url: 'http://realtime.cota.com/TMGTFSRealTimeWebService/Vehicle/VehiclePositions.pb',
      encoding: null
    };
    request(requestSettings, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
        for (entity of feed.entity) {
          // console.log(entity);
          if (entity.vehicle) {
            buses.push({
              "id": entity.id,
              "location": [entity.vehicle.position.longitude, entity.vehicle.position.latitude]
            });
          }
        }
        //console.log(buses);
        resolve(buses);
      } else {
        reject(error);
      }
    });
  });
}

function updateBuses(data) {
  // console.log("Inside updateBuses()");

  return new Promise((resolve, reject) => {  

    var fileData = require('./data/buses.json');
    var fileIds = Object.keys(fileData);
    var updateIds = data.map(x => x.id);
    
    for (bus of fileIds) {
      if( updateIds.indexOf(bus) < 0) { // Remove bus from file data
        delete fileData[bus];
      } else { // Append new point to existing bus
        var pointArray = fileData[bus];
        pointArray.push( data.find( j => j.id == bus ).location );
        while ( pointArray.length > NUM_SEGMENTS ) { pointArray.shift(); }
      }
    }
    var newIds = updateIds.filter( y => fileIds.indexOf(y) < 0 );
    for (newBusId of newIds) { // Add new bus to file
      newBus = data.find( z => z.id == newBusId );
      fileData[newBus.id] = [newBus.location];
    }
    resolve(fileData);
  });
}

exports.returnBuses = () => {
  return getBuses().then(data => { 
    return updateBuses(data).then(buses => {
      //console.log(JSON.stringify(buses, null, 4));  
      fs.writeFileSync("src/data/buses.json", JSON.stringify(buses));
      return buses
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));
}

