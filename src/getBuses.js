var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
var turf = require('turf');
var fs = require('fs');

var requestSettings = {
  method: 'GET',
  url: 'http://realtime.cota.com/TMGTFSRealTimeWebService/Vehicle/VehiclePositions.pb',
  encoding: null
};

function getBuses() {
  var buses = [];
  return new Promise((resolve, reject) => {
    request(requestSettings, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
        for (entity of feed.entity) {
          // console.log(entity);
          if (entity.vehicle) {
            buses.push({
              "id": entity.id,
              "location": { 
                "bearing": entity.vehicle.position.bearing,
                "point": turf.point([entity.vehicle.position.longitude, entity.vehicle.position.latitude])
              }
            });
          }
        }
        resolve(buses);
      } else {
        reject(error + response.statusCode);
      }
    });
  });
}

exports.returnBuses = () => {
  return getBuses().then(data => { 
    //console.log(JSON.stringify(buses, null, 4));
    // fs.writeFileSync("./data/buses.json", JSON.stringify(buses));  
    return data;
  }).catch(err => console.log(err));
}

