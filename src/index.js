import * as d3 from 'd3';
import * as d3geo from 'd3-geo';
import * as d3queue from 'd3-queue';

var buses;
var i270;

var getBuses = function(callback) {
    d3.json("/data/buses.json", function(error, json) {
        if(error) { console.log(error.toString()); }

        buses = json.map(b => { return b.location.point });

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

var ready = function() {
    
    buses.push(i270);

    console.log(JSON.stringify(buses, null, 4));

    var svg = d3.select("body")
                .append("svg")
                .attr("width", 1262)
                .attr("height", 800);

    var projection = d3geo.geoMercator()
                          .fitExtent([[0,0],[1262, 800]],i270);

    var path = d3geo.geoPath(projection); 

    svg.selectAll("path")
       .data(buses)
       .enter()
       .append("path")
       .attr("d", path);
}

d3queue.queue()
        .defer(getBuses)
        .defer(get270)
        .awaitAll(ready);