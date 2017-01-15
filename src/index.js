import * as d3 from 'd3';
import * as d3geo from 'd3-geo';
import * as d3queue from 'd3-queue';

var buses;
var i270;
var svg;
var projection; 
var path; 

var getBuses = function(callback) {
    d3.json("/buses", function(error, json) {
        if(error) { console.log(error.toString()); }

        buses = json.map(b => { var point = b.location.point; point.id = b.id; return point;  });

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
    
    // console.log(JSON.stringify(buses, null, 4));
    if( !projection ) { projection = d3geo.geoMercator().fitExtent([[0,0],[1262, 800]],i270); }
    
    if( !path ) { path = d3geo.geoPath(projection); }
    
    var paths = svg.selectAll("path")
                   .data(buses, id);

    paths.transition()
         .duration(4000)
         .attr("d", path)

    paths.enter()
         .append("path")
         .attr("d", path)
         .attr("opacity", 0)
         .transition()
         .duration(4000)
         .attr("opacity", 1);

    paths.exit()
         .transition()
         .duration(4000)
         .attr("opacity", 0)
         .remove();
    
    setTimeout(refresh, 5000);
}

var refresh = () => {
    d3queue.queue()
           .defer(getBuses)
           .defer(get270)
           .awaitAll(ready);
}

 
svg = d3.select("body")
        .append("svg")
        .attr("width", 1262)
        .attr("height", 800);
refresh();
