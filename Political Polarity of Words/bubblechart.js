//define global variables
var circles, categories, dataset , brush
var toggle = extreme = false;



//creating bubble chart
function bubbleChart(data){

    dataset = data

    //defining dimensions and margins for the bubble chart svg
    margin = {top: 100, right: 10, bottom: 40, left: 10},
    width = 960 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom;

    brush = d3.brushX()
    .on("start", brushstart)
    .on("end", brushend)
    .on("brush", update )
    .extent([[0,30],[width,160]]);

    //create svg for axis
    var axis = d3.select("#bubble").append("svg")
                .attr("viewBox", "0 0 "+width+" "+50)
                .attr("preserveAspectRatio", "none");               

    //append svg to the selected div created for bubble chart
    var svg = d3.select("#bubble").append("svg").attr('class' , 'main')
                .attr("viewBox", "0 0 "+width+" "+height)
                .attr("preserveAspectRatio", "none").append('g').attr('id' , 'bubbleG');

    
        
    var cell = svg.selectAll(".cell")
                  .data(['economy/fiscal issues', 'energy/environment','crime/justice' , 'education' , 'health care' , 'mental health/substance abuse'])
                  .enter().append("g")
                  .attr("class", "cell")
                  .attr('id' , d=>d)
                  .attr("transform", function(d , i) { return "translate(" + 0 + "," + (i*130)+ ")"; })

                  cell.call( brush)

    var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //add scale for the x-axis
    scaleX = d3.scaleLinear()
            .domain([-50, 50])
            .range([30, 890]);

    //define the size scale
    let size = d3.scaleSqrt().domain(d3.extent(data.map((d) => +d.total))).range([3, 10]);

    //define the color scale
    let color = d3.scaleOrdinal()
                    .domain(Array.from(new Set(data.map((d) => d.category))))
                    .range(d3.schemeCategory10);

    //Add the x-axis
    axis.selectAll('text')
        .data([-50,-40,-30,-20,-10,0,10, 20,30,40, 50])
        .enter()
        .append('text')
        .attr('y' , 45)
        .attr('x' , d=>{return this.scaleX(d)})
        .text(d=>{return +Math.abs(d)})
        .attr('text-anchor' , 'middle')
        .attr("font-size", "18px")
        .style('font-weight' , 'bold')

    //add axis label
    axis.append('text')
        .attr('x' , 0)
        .attr('y' , 20)
        .style('font-weight' , 'bold')
        .text('Democratic Leaning')

    //add axis label
    axis.append('text')
    .attr('x' , 780)
    .attr('y' , 20)
    .style('font-weight' , 'bold')
    .text('Republican Leaning')

    circles = g.append('g').selectAll("g").data(data)
        .enter();
    
    //add the circles to sourceX and sourceY positions
    circles.append('circle')
      .attr('id' , function(d) { return 'c'+d.index; } )
      .attr("r", function(d) { return size(+d.total); })
      .attr("cx", function(d) { return d.sourceX; })
      .attr("cy", function(d) { return d.sourceY; })
      .attr("fill", function(d){return d.color = color(d.category)})
      .style('stroke' , 'black')
      //add tooltip for circles
    .on('mouseover', function(d,i) {
        d3.select(this).attr("stroke-width" , '4px')
        d3.select('#tooltip').style("opacity", 1)
    })           
    .on('mousemove', function(d,i) {
        d3.select("#tooltip").style("opacity", 1)
        .html(i.phrase.charAt(0).toUpperCase()+ i.phrase.slice(1) +  "<br/>R+ " + Math.abs(i.position.toFixed(3)) +  "%<br/>In " + ((i.total/50)*100).toFixed(0) +'% of speeches')
        .style("left", (d.pageX + 10) + "px")
        .style("top", (d.pageY - 15) + "px");
    })
    .on('mouseout', function(d,i) {
       d3.select(this).attr("stroke-width" , '1px')
       d3.select('#tooltip').style("opacity", 0)
       .style("left","0px")
       .style("top", "0px");
    })
    drawTable(data)


      //define the categories name
      var category = ['Economy/fiscal issues','Economy/fiscal issues', 'Energy/environment','Crime/justice' , 'Education' , 'Health care' , 'Mental health/substance abuse']

      categories = g.selectAll("g").data(category)
        .enter();

        //append the categories labels to the chart
        categories.append('text')
        .attr('x' , 0)
        .attr('y' , -120)
        .style('font-weight' , 'bold')
        .attr("font-size", "18px")
        .attr('fill' , 'grey')
        .text(function(d){return d})



}


//Implementing Brush functions
var brushCell;

//update the selection on brush
function update({ selection }) {
  var currentCategory = d3.select(brushCell).attr('id')
  var currentData = dataset
  if(toggle == true)
  var currentData = dataset.filter(d=>{return d.category == currentCategory})

  circles.selectAll('circle').attr('opacity' , 0.2)
  if (selection == null) {
    circles.selectAll('circle').attr('opacity' , 1)
    drawTable(dataset)
  }
  else
  {
    const [x0,x1] = selection;
    if(x0 == x1) circles.selectAll('circle').attr('opacity' , 1)
    else
    {
      const phrases = currentData.filter(function(d){
        return ((d.moveX > x0) && (d.moveX < x1))
      });
        phrases.forEach((function(d) {
          d3.select("#c"+d.index).attr('opacity' , 1)
        }))
  drawTable(phrases)     

    }
  }       
}

  // Clear the previously-active brush, if any
  function brushstart({selection}) {
  if (brushCell !== this) {
    d3.select(brushCell).call(brush.move, null);
    brushCell = this;
  }
  if (selection == null) {
    circles.selectAll('circle').attr('opacity' , 1)
  }
}

  // brushend
  function brushend({selection}) {
  if (selection == null) {
    circles.selectAll('circle').attr('opacity' , 1)
    drawTable(dataset)
  }
}
    

//check for toggle on/off
document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.querySelector('input[type="checkbox"]');
  
    checkbox.addEventListener('change', function () {
      extreme = false
        d3.select('#bubbleG').style('opacity' , 1)
        d3.select('#NGramTableTable').style('opacity' , 1)
        d3.select('#annotation').remove()

      if (checkbox.checked) {
        // apply a transition for circles to move to new positions
        circles.selectAll('circle')
        .transition()           
        .duration(2000)         // apply it over 2000 milliseconds
        .attr("cx", function(d) { return d.moveX; })
        .attr("cy", function(d) { return d.moveY; })

        //apply transition for the text labels
        categories.selectAll('text')
        .transition()           
        .duration(2000)         // apply it over 2000 milliseconds
        .attr('y' , function(d,i){return i*130 -60})

        //state the toggle as true
        toggle = true
        

      } else {
        // apply a transition for circles to move back to original positions
        circles.selectAll('circle')
        .transition()           
        .duration(2000)         // apply it over 2000 milliseconds
        .attr("cx", function(d) { return d.sourceX; })
        .attr("cy", function(d) { return d.sourceY; })

        //apply transition for the text labels to hide back
        categories.selectAll('text')
        .transition()           
        .duration(2000)         // apply it over 2000 milliseconds
        .attr('y' , -120)

        //set toggle back as false
        toggle = false
      }
    });
  });


 //creating elements for storytelling
  function showExtremes(){

    if(extreme == true){
      extreme = false
      d3.select('#bubbleG').style('opacity' , 1)
      d3.select('#NGramTableTable').style('opacity' , 1)
      d3.select('#annotation').remove()

    }
    else{
      extreme = true

      d3.select('#NGramTableTable').style('opacity' , 0.3)
      d3.select('#bubbleG').style('opacity' , 0.3)

      svg = d3.select(".main").append('svg').attr('id' , 'annotation')
      .attr('width' , 950)
      .attr('height' , 1500)
      .attr('fill' , 'red')
      .attr('transform' , 'translate(0,0)')

      var annotationMin , annotationMax
      if(toggle == false){
        //annotations
       annotationMax = [
        {
          note: {
            label: "'School' is mentioned most number of times in speeches"
          },
          connector: {
            end: "dot",        
            type: "line",      
            lineType : "vertical",   
            endScale: 10  
          },
          
          color: ["red"],
          x: 440,
          y: 55,
          dy: 150,
          dx: 25
        }
      ]

      //least spoken term
      annotationMin = [
        {
          note: {
            label: "'School safe' is least mentioned term, which is mentioned only 5 times"
          },
          color: ["red"],
          x: 602,
          y: 82,
          dy: 70,
          dx: 25
        }
      ]
      }
      else{
         //annotations
       annotationMax = [
        {
          note: {
            label: "'School' is mentioned most number of times in speeches"
          },
          connector: {
            end: "dot",        
            type: "line",      
            lineType : "vertical",   
            endScale: 10  
          },
          
          color: ["red"],
          x: 448,
          y: 495,
          dy: 100,
          dx: 205
        }
      ]

      //least spoken term
      annotationMin = [
        {
          note: {
            label: "'School safe' is least mentioned term, which is mentioned only 5 times"
          },
          color: ["red"],
          x: 605,
          y: 352,
          dy: 70,
          dx: 215
        }
      ]
      
      }

      // Add annotation to the chart
        const makeAnnotationMax = d3.annotation()
        .annotations(annotationMax)
      svg
        .append("g")
        .call(makeAnnotationMax)
     
      // Add annotation to the chart
      const makeAnnotationsMin = d3.annotation()
        .annotations(annotationMin)
      svg
        .append("g")
        .call(makeAnnotationsMin)


    }
  }