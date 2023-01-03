// Lane Zaugg
// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const CHART_WIDTH_INNER = CHART_WIDTH - MARGIN.left - MARGIN.right;
const CHART_HEIGHT_INNER = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const ANIMATION_DUATION = 300;
var BarSvg , LineSvg , AreaSvg , ScatterSvg

setup();

function setup () {

  // Fill in some d3 setting up here if you need
  // for example, svg for each chart, g for axis and shapes

  BarSvg = d3.select("#Barchart-div")
              .append("svg")
              .attr("width", CHART_WIDTH )
              .attr("height", CHART_HEIGHT )
              .append("g").attr('class' , 'bar-chart')
              .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")");

  LineSvg = d3.select("#Linechart-div")
              .append("svg")
              .attr("width", CHART_WIDTH )
              .attr("height", CHART_HEIGHT )
              .append("g")
              .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")");
              
  AreaSvg = d3.select("#Areachart-div")
              .append("svg")
              .attr("width", CHART_WIDTH )
              .attr("height", CHART_HEIGHT )
              .append("g")
              .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")");

  ScatterSvg = d3.select("#Scatterplot-div")
              .append("svg")
              .attr("width", CHART_WIDTH )
              .attr("height", CHART_HEIGHT )
              .append("g").attr('class' , 'scatter-plot')
              .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")");

  changeData();
}

/**
 * Render the visualizations
 * @param data
 */
function update(data) {
    // ****** TODO ******
    const attribute = d3.select('#metric').property('value');

    // Syntax for line generator.
    // when updating the path for line chart, use the function as the input for 'd' attribute.
    // https://github.com/d3/d3-shape/blob/main/README.md

    //scaling for bar chart
    var x = d3.scaleBand().range([0, CHART_WIDTH_INNER])
    var y = d3.scaleLinear().range([CHART_HEIGHT_INNER, 0]).nice();

    //time scaling for line chart and area chart
    var t = d3.scaleTime().range([0, CHART_WIDTH_INNER])

    const lineGenerator = d3.line()
        .x(d => t(new Date(d.date)))
        .y(d => y(d[attribute]));


    // Syntax for area generator.
    // the area is bounded by upper and lower lines. So you can specify x0, x1, y0, y1 seperately. Here, since the area chart will have upper and lower sharing the x coordinates, we can just use x(). 
    // Similarly, use the function as the input for 'd' attribute. 
    const areaGenerator = d3.area()
        .x(d => t(new Date(d.date)))
        .y1(d => y(d[attribute]))
        .y0(CHART_HEIGHT_INNER);

    //Set up scatter plot x and y axis. 
    //Since we are mapping death and case, we need new scales instead of the ones above. 
    //deaths would be the horizontal axis, so we need to use width related constants.
    //Deaths would be vertical axis, so that would need to use height related constants.
    var xAxis = d3.scaleLinear().range([0, CHART_WIDTH_INNER]);
    var yAxis = d3.scaleLinear().range([CHART_HEIGHT_INNER, 0]);

    //TODO
    // call each update function below, adjust the input for the functions if you need to.
    updateBarChart(x, y, attribute, data)
    updateLineChart(t, y, lineGenerator, attribute, data)
    updateAreaChart(t, y, areaGenerator, attribute, data)
    updateScatterPlot(xAxis, yAxis, data)
}

/**
 * Update the bar chart
 */

function updateBarChart (x, y, attribute, data) {

  d3.selectAll('.axis').remove()

  const xAxis = BarSvg.append("g").attr("class", "axis").attr("transform", `translate(0,${CHART_HEIGHT_INNER})`)
  const yAxis = BarSvg.append("g").attr("class", "axis").attr("transform", `translate(-5,0)`)

   // update x axis
  x.domain(data.map(d => d.date))
  xAxis.call(d3.axisBottom(x))
 
   // update y axis
  y.domain([0, d3.max(data, d => d[attribute]) ]).nice();
  yAxis.call(d3.axisLeft(y));

  xAxis.select(".domain").remove()

   // create the update variable
  var u = BarSvg.selectAll("rect")
          .data(data)
      u.join("rect")
        .attr('class' , 'rect')
        .transition()
        .duration(ANIMATION_DUATION)
        .attr("x", d => x(d.date))
        .attr("y", d => y(d[attribute]))
        .attr("width", x.bandwidth()/1.2)
        .attr("height", d => CHART_HEIGHT_INNER - y(d[attribute]))
}

/**
 * Update the line chart
 */

function updateLineChart(t, y, lineGenerator, attribute, data) {

  d3.selectAll('.LineAxis').remove()

  const xAxis = LineSvg.append("g").attr("class", "LineAxis").attr("transform", `translate(0,${CHART_HEIGHT_INNER})`)
  const yAxis = LineSvg.append("g").attr("class", "LineAxis")

   // update x axis
   t.domain(d3.extent(data, function(d) { return new Date(d.date)}))
   xAxis.call(d3.axisBottom(t).tickFormat(d3.timeFormat("%m/%d")))
 
   // update y axis
   y.domain([0, d3.max(data, d => d[attribute]) ]).nice();
   yAxis.call(d3.axisLeft(y));

   // create update variable
  var u = LineSvg.selectAll(".line-chart")
          .data([data]);
      u.enter()
        .append("path")
        .attr("class","line-chart")
        .merge(u)
        .transition()
        .duration(ANIMATION_DUATION)
        .attr("d", lineGenerator)
}

/**
 * Update the area chart 
 */

function updateAreaChart(t, y, areaGenerator, attribute, data) {

  d3.selectAll('.AreaAxis').remove()

  const xAxis = AreaSvg.append("g").attr("class", "AreaAxis").attr("transform", `translate(0,${CHART_HEIGHT_INNER})`)
  const yAxis = AreaSvg.append("g").attr("class", "AreaAxis")

   // update x axis
   t.domain(d3.extent(data, function(d) { return new Date(d.date)}))
   xAxis.call(d3.axisBottom(t).tickFormat(d3.timeFormat("%m/%d")))
 
   // update y axis
   y.domain([0, d3.max(data, d => d[attribute]) ]).nice();
   yAxis.call(d3.axisLeft(y));

   // create update variable
    var AreaUpdate = AreaSvg.selectAll(".area-chart")
                     .data([data]);
        AreaUpdate.enter()
            .append("path")
            .attr("class","area-chart")
            .merge(AreaUpdate)
            .transition()
            .duration(ANIMATION_DUATION)
            .attr("d", areaGenerator)
}

/**
 * update the scatter plot.
 */

function updateScatterPlot(x, y, data) {

  d3.selectAll('.ScatterAxis').remove()

  const xAxis = ScatterSvg.append("g").attr("class", "ScatterAxis").attr("transform", `translate(0,${CHART_HEIGHT_INNER})`)
  const yAxis = ScatterSvg.append("g").attr("class", "ScatterAxis")

   // update x axis
   x.domain([0, d3.max(data, d => d.cases)]).nice()
   xAxis.call(d3.axisBottom(x))
 
   // update y axis
   y.domain([0, d3.max(data, d => d.deaths) ]).nice();
   yAxis.call(d3.axisLeft(y));

   const dot = ScatterSvg.selectAll('circle')
               .data(data)
         dot.enter()
            .append("circle")
            .merge(dot)
            .transition()
            .duration(ANIMATION_DUATION)
            .attr("cx", d => x(d.cases))
            .attr("cy", d => y(d.deaths))
            .attr("r", 5)

     d3.selectAll('.scatter-plot circle').on('click' , function(d , i){
      console.log('Cases: ' , i.cases , ', Deaths: ' , i.deaths)
     })
}

/**
 * Update the data according to document settings
 */

function changeData() {

  //  Load the file indicated by the select menu
  const dataFile = d3.select('#dataset').property('value');

  d3.csv(`data/${dataFile}.csv`)
    .then(dataOutput => {

      /**
       * D3 loads all CSV data as strings. While Javascript is pretty smart
       * about interpreting strings as numbers when you do things like
       * multiplication, it will still treat them as strings where it makes
       * sense (e.g. adding strings will concatenate them, not add the values
       * together, or comparing strings will do string comparison, not numeric
       * comparison).
       *
       * We need to explicitly convert values to numbers so that comparisons work
       * when we call d3.max()
       **/

      const dataResult = dataOutput.map((d) => ({
        cases: parseInt(d.cases),
        deaths: parseInt(d.deaths),
        date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))
      }));

      if (document.getElementById('random').checked) {
        // if random subset is selected
        update(randomSubset(dataResult));
      } else {
        update(dataResult);
      }
    }).catch(e => {
      console.log(e);
      alert('Error!');
    });
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */

function randomSubset (data) {
  return data.filter((d) => Math.random() > 0.5);
}
