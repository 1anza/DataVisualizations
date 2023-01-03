/** Class representing the map view. */
class MapVis {
  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState;

    // Set up the map projection
    const projection = d3.geoWinkel3()
      .scale(150) // This set the size of the map
      .translate([400, 250]); // This moves the map to the center of the SVG

    var path = d3.geoPath()
      .projection(projection);
    
    const world = globalApplicationState.mapData
    const covidData = globalApplicationState.covidData


      var nested_data = d3.rollup(covidData, v => d3.sum(v, d => d.total_cases_per_million), d => d.iso_code)
 
      var max = d3.least(d3.rollup(covidData, v => d3.sum(v, d => d.total_cases_per_million), d => d.iso_code), ([, sum]) => -sum)

      var colorScale = d3.scaleLinear()
                        .domain([0 , max[1]])
                        .range([ '#FEF5EE','red'])

      var graticule = d3.geoGraticule();
      d3.select('#graticules').append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path);
            d3.select('#graticules').append("path")
            .datum(graticule.outline)
            .attr("class", "graticule_outline")
            .style('stroke' , 'black')
            .style('fill' , 'none')
            .attr("d", path)

      d3.select('#countries')
      .selectAll('path')
      .data(topojson.feature(world, world.objects.countries).features)
      .enter()
      .append('path')
      .attr("d", path)
      .attr('class', 'country')
      .attr('id', function(d){return d.id})
      .style('fill' , function(d){
        d.total = nested_data.get(d.id) || 0;
        return colorScale(d.total)
            })
      .on('click' , function(d , e){
       if( globalApplicationState.selectedLocations.indexOf(e.id) === -1)
        globalApplicationState.selectedLocations.push(e.id)
        globalApplicationState.worldMap.updateSelectedCountries()        
      })

      //append legend
      var w = 85, h = 150;

      var key = d3.select('#map')
		.append("g")
		.attr("width", w)
		.attr("height", h)
		.attr("class", "legend");

      var legend = key.append("defs")
        .append("g:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

      legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", '#FEF5EE')
        .attr("stop-opacity", 1);
        
      legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", 'red')
        .attr("stop-opacity", 1);

      key.append("rect")
          .attr("width", w - 65)
          .attr("height", h)
          .style("fill", "url(#gradient)")
          .attr("transform", "rotate(-90)translate(" + (-500) + ",10)");

      var y = d3.scaleLinear()
        .range([h, 0])
        .domain([max[1], 0]);

      var yAxis = d3.axisTop(y).tickValues(y.domain()).tickFormat(d3.format(".2s"));

      key.append("g")
        .attr("class", "map-axis")
        .attr("transform", "translate(10,480)")
        .call(yAxis)
      

  }

 updateSelectedCountries () {
    globalApplicationState.selectedLocations.forEach(location=>{
      d3.select('#'+location+'.country').classed('selected' , true)
    })
    globalApplicationState.lineChart.updateSelectedCountries()        

  }
}
