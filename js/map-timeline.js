/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////// MAP WITH CONNECTIONS//////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

// var svg = d3.select("#map-timeline"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height");

// // Map and projection
// var projection = d3.geo.mercator()
//     .scale(85)
//     .translate([width/2, height/2*1.3])

// // Create data: coordinates of start and end
// var link = [
//   {type: "LineString", coordinates: [[38, 63], [-60, -30]]},
//   {type: "LineString", coordinates: [[10, -20], [-60, -30]]},
//   {type: "LineString", coordinates: [[10, -20], [130, -30]]}
// ]

// // A path generator
// var path = d3.geo.path()
//     .projection(projection)

// // Load world shape
// d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(data){

//     // Draw the map
//     svg.append("g")
//         .selectAll("path")
//         .data(data.features)
//         .enter().append("path")
//             .attr("fill", "#b8b8b8")
//             .attr("d", d3.geo.path()
//                 .projection(projection)
//             )
//             .style("stroke", "#fff")
//             .style("stroke-width", 0)

//     // Add the path
//     svg.selectAll("myPath")
//       .data(link)
//       .enter()
//       .append("path")
//         .attr("d", function(d){ return path(d)})
//         .style("fill", "none")
//         .style("stroke", "orange")
//         .style("stroke-width", 7)

// })

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////MAP WITH CATEGORIES/////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
		
Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */

//Width and height of map
var width = 1000;
var height = 500;

// D3 Projection
var projection = d3.geo
  .mercator()
  .translate([width / 3.5, (height / 2.6) * 1.3]) // translate to center of screen
  .scale([160]); // scale things down so see entire US

// Define path generator
var path = d3.geo
  .path() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

// Define linear scale for output
var color = d3.scale
  .linear()
  .range([
    "rgb(213,222,217)",
    "rgb(69,173,168)",
    "rgb(84,36,55)",
    "rgb(217,91,67)"
  ]);

var legendText = [
  "Professional Experience",
  "Education",
  "Other Experiences",
  "Nada"
];

//Create SVG element and append map to the SVG
var svg = d3
  .select("#map-timeline")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Append Div for tooltip to SVG
var div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load in my states data!
d3.csv("js/stateslived.csv", function(data) {
  console.log(data);
  color.domain([0, 1, 2, 3]); // setting the range of the input data

  // Load GeoJSON data and merge with states data
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
    function(json) {
      console.log(json.features[0].properties.name);
      // Loop through each state data value in the .csv file
      for (var i = 0; i < data.length; i++) {
        // console.log(data);
        // Grab State Name
        var dataCountry = data[i].country;

        // Grab data value
        var dataValue = data[i].visited;

        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.name;

          if (dataCountry == jsonState) {
            // Copy the data value into the JSON
            json.features[j].properties.visited = dataValue;

            // Stop looking through the JSON
            break;
          }
        }
      }

      // Bind the data to the SVG and create one path per GeoJSON feature
      svg
        .selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .style("fill", function(d) {
          // Get data value
          var value = d.properties.visited;

          if (value) {
            //If value exists…
            return color(value);
          } else {
            //If value is undefined…
            return "rgb(213,222,217)";
          }
        });

      // Map the cities I have lived in!
      d3.csv("js/cities-lived.csv", function(data) {
        console.log(data);
        svg
          .selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", function(d) {
            return projection([d.lon, d.lat])[0];
          })
          .attr("cy", function(d) {
            return projection([d.lon, d.lat])[1];
          })
          .attr("r", function(d) {
            return Math.sqrt(d.years) * 4;
          })
          .style("fill", d => {
            return color(d.visited);
          })
          .style("opacity", 0.85)

          // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
          // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
          .on("mouseover", function(d) {
            div
              .transition()
              .duration(200)
              .style("opacity", 0.9);
            div
              .text(d.place)
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY - 28 + "px");
          })

          // fade out tooltip on mouse out
          .on("mouseout", function(d) {
            div
              .transition()
              .duration(500)
              .style("opacity", 0);
          });
      });

      // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
      var legend = d3
        .select("#map-timeline")
        .append("svg")
        .attr("class", "legend")
        .attr("width", 200)
        .attr("height", 200)
        .selectAll("g")
        .data(
          color
            .domain()
            .slice()
            .reverse()
        )
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
          return "translate(0," + i * 20 + ")";
        });

      legend
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

      legend
        .append("text")
        .data(legendText)
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) {
          return d;
        });
    }
  );
});
