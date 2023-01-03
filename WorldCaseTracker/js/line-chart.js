/** Class representing the line chart view. */
class LineChart {
  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {

    d3.selectAll('#overlay path').remove()
    d3.selectAll('#overlay text').remove()
    d3.selectAll('#lines path').remove()
    d3.selectAll('.mouse-per-line').remove()

    // Set some class level variables
    this.globalApplicationState = globalApplicationState;

    const lineData  = globalApplicationState.covidData

    let continentsData = lineData.filter(f => f.iso_code.toLowerCase().startsWith('owid'))

    var dates = continentsData.map(d => (new Date(d.date)));

    var continents = Array.from(
	    d3.group(continentsData , d=> d.location), ([key, value]) => ({key, value})
	  );

    var formatSuffixDecimal2 = d3.format(".2s")

    var margin = {top: 20, right: 50, bottom: 50, left: 80},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

 
    // Set the ranges
    var x = d3.scaleTime().range([0, width]);  
    var y = d3.scaleLinear().range([height, 0]);

    // Define the line
    var cases_line = d3.line()	
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.total_cases_per_million); });

        x.domain(d3.extent(continentsData.map(d => (new Date(d.date))))).nice();
        y.domain([d3.min(continentsData, function(d) { return parseFloat(d.total_cases_per_million); }), d3.max(continentsData, function(d) { return parseFloat(d.total_cases_per_million); })]).nice();


    // set the color scale
    var color = d3.scaleOrdinal(d3.schemeCategory10);

      // Add the X Axis
        d3.select('#x-axis')
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));

      // Add the Y Axis 
      d3.select('#y-axis')
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .call(d3.axisLeft(y));

        continents.forEach(function(d,i) {
          d3.select('#lines')
          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
          .append("path")
            .attr("class", "line")
            .style("stroke", function() { // Add the colors dynamically
                return d.color = color(d.key); })
            .style('fill' , 'none')
            .attr("d", cases_line(d.value));
          
        });

      //mouse-over line 
      var mouseG = d3.select('#overlay')
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      .attr("class", "mouse-over-effects");
      
      mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "1");

      var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(continents)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

      mousePerLine.append("text")
      .attr("transform", "translate(10,3)");
      
      var lines = document.getElementsByClassName('line')

      mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', function () { // on mouse in show line, circles and text
        
      })
      .on('mousemove', function () { // update tooltip content, line, circles and text when mouse moves
        let mouse = d3.pointer(event);
        d3.select(".mouse-line")
          .attr("d", () => {
            let d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;

          });
          var sortingObj = []
        d3.selectAll(".mouse-per-line")
          .attr("transform", function (d, i) {
            var xDate = x.invert(mouse[0]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
            var bisect = d3.bisector(function (d) { return d.date; }).left // retrieve row index of date on parsed csv
            var idx = bisect(d.value, xDate);

            let beginning = 0,
                  end = lines[i].getTotalLength(),
                  target = null;
                while (true) {
                  let target = Math.floor((beginning + end) / 2);
                  var pos = lines[i].getPointAtLength(target); //issue here
                  if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                    break;
                  }
                  if (pos.x > mouse[0]) {
                    end = target;
                  }
                  else if (pos.x < mouse[0]) {
                    beginning = target;
                  }
                  else break; //position found
                }
                
                sortingObj.push({total: d.value[idx].total_cases_per_million, location: d.value[idx].location , date:d.value[idx].date})
                

            return "translate(" + x(d.value[idx].date) + "," + y(d.value[idx].total_cases_per_million) + ")";

          });
          sortingObj.sort(function(x, y){
            return d3.descending(x.total, y.total);
         })
         d3.selectAll('#overlay text').remove()
         sortingObj.forEach(function(a,b){
          d3.select('#overlay').append('text')
          .attr("transform" , function(){
            if(mouse[0]<370)
            return "translate(" + x(a.date) + "," + b*15 + ")";
            else
            return "translate(" + (x(a.date) - 150) + "," + b*15 + ")";
          })
          .text( function(){
            if(a.total>1)
            return a.location +' ' + formatSuffixDecimal2(a.total) 
        })
          .style('font-family', 'Arial')
              .style('font-size', '14px')
          .style("stroke", function() { // Add the colors dynamically
            return  color(a.location); })
         })

      })

      var svg = d3.select('#line-chart')
          // text label for the x axis
          svg.append("text")             
          .attr("transform",
                "translate(" + (width/2) + " ," + 
                              (height + margin.top + 40) + ")")
          .style("text-anchor", "middle")
          .text("Date");

          // text label for the y axis
          svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Cases per million");

  }

  updateSelectedCountries () {

    d3.selectAll('#overlay path').remove()
    d3.selectAll('#overlay text').remove()
    d3.selectAll('#lines path').remove()
    d3.selectAll('.mouse-per-line').remove()

    const lineData  = globalApplicationState.covidData

    var formatSuffixDecimal2 = d3.format(".2s")

    var selectedLocationData = []
    globalApplicationState.selectedLocations.forEach(d=>{
      var filteredLocationData = lineData.filter(e=>{return e.iso_code == d})
      Array.prototype.push.apply(selectedLocationData,filteredLocationData); 
    })

    var dates = selectedLocationData.map(d => (new Date(d.date)));

    var countries = Array.from(
	    d3.group(selectedLocationData , d=> d.location), ([key, value]) => ({key, value})
	  );

    console.log('cont' , countries)

    var margin = {top: 20, right: 50, bottom: 50, left: 80},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

 
    // Set the ranges
    var x = d3.scaleTime().range([0, width]);  
    var y = d3.scaleLinear().range([height, 0]);

    // Define the line
    var cases_line = d3.line()	
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.total_cases_per_million); });

        
    x.domain(d3.extent(dates)).nice();
    y.domain([d3.min(selectedLocationData, function(d) { return parseFloat(d.total_cases_per_million); }), d3.max(selectedLocationData, function(d) { return parseFloat(d.total_cases_per_million); })]).nice();


      // set the color scale
    var color = d3.scaleOrdinal(d3.schemeCategory10);

        // Add the X Axis
        d3.select('#x-axis')
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));

      // Add the Y Axis 
      d3.select('#y-axis')
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .call(d3.axisLeft(y));

        countries.forEach(function(d,i) {
           d3.select('#lines')
          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
          .append("path")
            .attr("class", "line")
            .style("stroke", function() { // Add the colors dynamically
                return d.color = color(d.key); })
            .style('fill' , 'none')
            .attr("d", cases_line(d.value));       
          
        });

        //mouse-over line
        
      var mouseG = d3.select('#overlay')
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      .attr("class", "mouse-over-effects");
      
      mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "1");

      var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(countries)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

      mousePerLine.append("text")
      .attr("transform", "translate(10,3)");
      
      var lines = document.getElementsByClassName('line')


      mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', function () { // on mouse in show line, circles and text
        
      })
      .on('mousemove', function () { // update tooltip content, line, circles and text when mouse moves
        let mouse = d3.pointer(event);
        d3.select(".mouse-line")
          .attr("d", () => {
            let d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;

          });
          console.log(mouse[0])
          var sortingObj = []
        d3.selectAll(".mouse-per-line")
          .attr("transform", function (d, i) {
            var xDate = x.invert(mouse[0]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
            var bisect = d3.bisector(function (d) { return d.date; }).left // retrieve row index of date on parsed csv
            var idx = bisect(d.value, xDate);

            let beginning = 0,
                  end = lines[i].getTotalLength(),
                  target = null;
                while (true) {
                  let target = Math.floor((beginning + end) / 2);
                  var pos = lines[i].getPointAtLength(target); //issue here
                  if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                    break;
                  }
                  if (pos.x > mouse[0]) {
                    end = target;
                  }
                  else if (pos.x < mouse[0]) {
                    beginning = target;
                  }
                  else break; //position found
                }
                
                sortingObj.push({total: d.value[idx].total_cases_per_million, location: d.value[idx].location , date:d.value[idx].date})
                

            return "translate(" + x(d.value[idx].date) + "," + y(d.value[idx].total_cases_per_million) + ")";

          });
          sortingObj.sort(function(x, y){
            return d3.descending(x.total, y.total);
         })
         d3.selectAll('#overlay text').remove()
         sortingObj.forEach(function(a,b){
          d3.select('#overlay').append('text')
          .attr("transform" , function(){
            if(mouse[0]<370)
            return "translate(" + x(a.date) + "," + b*15 + ")";
            else
            return "translate(" + (x(a.date) - 150) + "," + b*15 + ")";
          })
          .text( function(){
              if(a.total>1)
              return a.location +' ' + formatSuffixDecimal2(a.total) 
          })
          .style('font-family', 'Arial')
          .style('font-size', '14px')
          .style("stroke", function() { // Add the colors dynamically
            return  color(a.location); })
         })

      })


  }
}
