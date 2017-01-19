import * as d3 from 'd3';
import * as turf from 'turf';

var buses;
var i270;
var shapes = {};
var trips = {};

var svg;
var projection; 
var path; 
var path2;
var path3;

var HEIGHT = 800;
var WIDTH = 1262;
var FADE_DURATION = 2000; 
var FETCH_INTERVAL = 10000;

var getShapes = function(callback) {
  var row = function(d) {
    return {
        shape_id: +d.shape_id, 
        shape_pt_lon: +d.shape_pt_lon,
        shape_pt_lat: +d.shape_pt_lat,
        shape_pt_sequence: +d.shape_pt_sequence // convert "Length" column to number
    };
  }

  d3.csv('/data/shapes.txt', row, (error, csv) => { 
    for( var line of csv ) {
        if ( shapes[line.shape_id] == undefined ) {
            shapes[line.shape_id] = [];
        }
        shapes[line.shape_id].push(line);
    }
    callback(null);
  });
}

var getTrips = function(callback) { // returns an object with trip_id keys with shape_id values 
    d3.csv('/data/trips.txt', (error, csv) => { 
        for( var t of csv) { trips[t.trip_id] = t.shape_id } 
        callback(null);
    });
}

var getShapeForTrip = function(trip_id) {
    var shape_id = trips[trip_id];
    //var ret = shapes[shape_id].sort((i1, i2) => d3.ascending(i1.shape_pt_sequence, i2.shape_pt_sequence)).map(s => [s.shape_pt_lon, s.shape_pt_lat]); 
    var ret = shapes[shape_id].map(s => [s.shape_pt_lon, s.shape_pt_lat]); 
    // console.log(ret);
    return ret;
}

var getBuses = function(callback) {
    d3.json("/buses", function(error, json) {
        if(error) { console.log(error.toString()); }
        // console.log(json);
        // buses = json.map(b => { var point = b.location.point; point.id = b.id; return point;  });
        buses = [];
        for (var aKey of Object.keys(json)) {
            var b = json[aKey];
            buses.push({"id": aKey, "location":turf.point(b.location.slice(-1)[0]), "trip_id": b.trip_id});
        }

        callback(null);
    }); 
}

var get270 = function(callback) {
    d3.json("/data/I270.geojson", function(error, json) {
        if(error) { console.log(error.toString()); }
        i270 = json;
        callback(null);
    });
}

var once = function() {
    if( !projection ) { projection = d3.geoMercator().fitExtent([[10,10],[WIDTH, HEIGHT]],i270); }
    
    if( !path ) { path = d3.geoPath(projection); }

    if( !path2 ) { path2 = someData => { return d3.geoPath(projection)( turf.lineString(getShapeForTrip(someData.trip_id)) ); } }

    if( !path3 ) { path3 = someData => { return d3.geoPath(projection).pointRadius(3)(someData.location); } }

    svg.selectAll("path.i270")
       .data([i270])
       .enter()
       .append("path")
       .classed("i270", true)
       .attr("d", path);

    ready();
}

var ready = function() {
    var id = function(bus) { return bus.id; }

    var paths = svg.selectAll("path.shape")
                   .data(buses, id);
    paths.enter()
         .append("path")
         .classed("shape", true)
         .attr("d", path2)
         .style("stroke",function() {
            return "hsl(" + Math.random() * 360 + ",100%,50%)";
         });

    paths.exit()
         .remove();

    var busPaths = svg.selectAll("path.bus")
                      .data(buses, id);
    busPaths.transition()
            .ease(d3.easeLinear)
            .duration(FETCH_INTERVAL - 2000)
            .attr("d", path3);
         
    busPaths.enter()
            .append("path")
            .classed("bus", true)
            .attr("d", path3)
            .attr("opacity", 0)
            .transition()
            .duration(FADE_DURATION)
            .attr("opacity", 1);

    busPaths.exit()
            .transition()
            .duration(FADE_DURATION)
            .attr("opacity", 0)
            .remove();
}

var refresh = () => {
    d3.queue()
      .defer(getBuses)
      .awaitAll(ready);
}

svg = d3.select("body")
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

d3.queue()
  .defer(getShapes)
  .defer(getTrips)
  .defer(getBuses)
  .defer(get270)
  .awaitAll(once);

d3.interval(refresh, FETCH_INTERVAL);