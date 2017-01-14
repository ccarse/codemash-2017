import * as d3 from 'd3';
import * as scale from 'd3-scale';

d3.json("/data/buses.json", function(error, json) {
    if(error) { console.log(error.toString()); }
    
    // d3.select("body")
    //   .selectAll("p")
    //   .data(json)
    //   .enter()
    //   .append("p")
    //   .text(b => { return JSON.stringify(b.location.point.geometry.coordinates[1]); } );

    // var svg = d3.select("body")
    //             .append("svg")
    //             .attr("width", 1262)
    //             .attr("height", 800);
    
    // var xScale =scale.scaleLinear()
    //                     .domain([-82.75,-83.25])
    //                     .range([1, 1000]);
    // var yScale =scale.scaleLinear()
    //                     .domain([39.7, 40.25])
    //                     .range([1, 700]);

    // svg.selectAll("circle")
    //    .data(json)
    //    .enter()
    //    .append("circle")
    //    .attr("cx", function(d) { return xScale(d.location.point.geometry.coordinates[0]) })
    //    .attr("cy", function(d) { return yScale(d.location.point.geometry.coordinates[1])  })
    //    .attr("r", 10)
    //    .attr("fill", "red")

    
}); 