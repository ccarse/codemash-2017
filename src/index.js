import * as d3 from 'd3';
import * as turf from 'turf';

var buses;
var i270;
var svg;
var projection; 
var path; 
var HEIGHT = 800;
var WIDTH = 1262;
var DURATION = 10000; 

var getBuses = function(callback) {
    d3.json("/buses", function(error, json) {
        if(error) { console.log(error.toString()); }
        // console.log(json);
        // buses = json.map(b => { var point = b.location.point; point.id = b.id; return point;  });
        buses = Object.values(json).map(b => turf.lineString(b));

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

var id = function(bus) { return bus.id; }

var ready = function() {

    if( !projection ) { projection = d3.geoMercator().fitExtent([[10,10],[WIDTH, HEIGHT]],i270); }
    
    if( !path ) { path = d3.geoPath(projection); }
    
    svg.selectAll("path.i270")
       .data([i270])
       .enter()
       .append("path")
       .classed("i270", true)
       .attr("d", path);

    var paths = svg.selectAll("path.bus")
                   .data(buses, id);

    paths.transition()
         .ease(d3.easeLinear)
         .duration(DURATION)
         .attr("d", path);
         
    paths.enter()
         .append("path")
         .classed("bus", true)
         .attr("d", path)
         .attr("opacity", 0)
         .transition()
         .duration(DURATION)
         .attr("opacity", 1);

    paths.exit()
         .transition()
         .duration(DURATION)
         .attr("opacity", 0)
         .remove();
    
    setTimeout(refresh, DURATION);
}

var refresh = () => {
    d3.queue()
           .defer(getBuses)
           .defer(get270)
           .awaitAll(ready);
}

 
svg = d3.select("body")
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);
refresh();
