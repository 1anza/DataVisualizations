//define width for bar charts
let barWidth = 80;
let barHeight = 20;
let barWidthPercent = 110;
let color

//define the x scale for frequency bar width
let scaleFreq = d3.scaleLinear()
            .domain([0, 1])
            .range([0, barWidth-10]);

//define the x scale for percentages bar width
let scalePercent = d3.scaleLinear()
        .domain([-100, 100])
        .range([0, barWidth]);

let headerData = [
    {
        sorted: false,
        ascending: false,
        key: 'phrase'
    },
    {
        sorted: false,
        ascending: false,
        key: 'frequency'
    },
    {
        sorted: false,
        ascending: false,
        key: 'percentage'
    },
    {
        sorted: false,
        ascending: false,
        key: 'total'
    }
]

//define the heads of table
function AddTableHead(){
    //Phrase
    d3.select('#phrase')
    .attr('width', barWidth)
    .attr('height', barHeight+10)
    .append('text').attr('x' , 40).attr('y' , 10).text('Phrase');

    //Frequency
    d3.select('#freq')
    .attr('width', barWidth)
    .attr('height', barHeight+20)
    .append('text').attr('x' , 10).attr('y' , 10).text('Frequency')
    
    d3.select('#freq').append("g")
      .attr("transform", "translate(0," + 40 + ")")
      .call(d3.axisTop(scaleFreq).ticks(3))
    
    //Percentage
    d3.select('#percent')
    .attr('width', barWidthPercent)
    .attr('height', barHeight+20)
    .append('text').attr('x' , 5).attr('y' , 10).text('Percentages');

    d3.select('#percent').append("g")
      .attr("transform", "translate(10," + 40 + ")")
      .call(d3.axisTop(scalePercent).ticks(3)
      .tickFormat(function (d) {return (Math.abs(d));}))

    //Total
    d3.select('#total')
    .attr('width', barWidth/2)
    .attr('height', barHeight+10)
    .append('text').attr('x' , 5).attr('y' , 10).text('Total');

}

function drawTable(data){
        //define the color scale
        color = d3.scaleOrdinal()
        .domain(Array.from(new Set(data.map((d) => d.category))))
        .range(d3.schemeCategory10);

        //Add data in body of the table
        let rowSelection = d3.select('#NGramTableBody')
                .selectAll('tr')
                .data(data)
                .join('tr');
        //add the textual data
        let forecastSelection = rowSelection.selectAll('td')
                .data(rowToCellDataTransform)
                .join('td')
                // .attr('class', d => d.class)
                .text(function(d){
                    if(d.type == 'text')
                    return d.value
                })

            //define selectors for frequency column
        let vizSelectionFrequency = forecastSelection.filter(d => d.type === 'freq');

        let svgFrequency = vizSelectionFrequency.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', barWidth)
            .attr('height', barHeight);

        let grouperFrequency = svgFrequency.selectAll('g')
            .data(d => [d])
            .join('g');

        //add rectanges for the frequency column
        FrequencyRectangles(grouperFrequency)
        
        //define selectors for Percentages column
        let vizSelectionPercentages = forecastSelection.filter(d => d.type === 'percent');

        let svgPercentages = vizSelectionPercentages.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', barWidthPercent)
            .attr('height', barHeight)
            .attr("transform", "translate(10,0)")

        let grouperPercentages = svgPercentages.selectAll('g')
            .data(d => [d])
            .join('g');
        
        //add rectanges for the Percentages column
        PercentagesRectangles(grouperPercentages)

        attachSortHandlers(data)

        
 
}

function PercentagesRectangles(containerPercentages){

    containerPercentages.append('rect')
    .attr('x' , scalePercent(0)+1)
    .attr('y' , 0)
    .attr('width' , d=>{return (scalePercent(d.value.r_speeches) - scalePercent(0))})
    .attr('height' , 20)
    .attr("fill", 'firebrick')

    containerPercentages.append('rect')
    .attr('x' , d=>{return (scalePercent(d.value.d_speeches))})
    .attr('y' , 0)
    .attr('width' , d=>{return ( scalePercent(0) - scalePercent(d.value.d_speeches))})
    .attr('height' , 20)
    .attr("fill", 'steelblue')
}

//add rectanges for the frequency column
function FrequencyRectangles(containerFrequency){



    //append the rectangles
    containerFrequency.append('rect')
    .attr('x' , scaleFreq(0))
    .attr('y' , 0)
    .attr('width' , d=>{return scaleFreq(d.value)})
    .attr('height' , 20)
    .attr("fill", (d) => d.color)
}

function rowToCellDataTransform(d) {
    let phraseInfo = {
        type: 'text',
        value: d.phrase
    };

    let frequencyInfo = {
        type: 'freq',
        color: d.color,
        value: (d.total/50),
        category: d.category
    };

    let percentagesInfo = {
        type: 'percent',
        value: {
            d_speeches : d.percent_of_d_speeches*-1,
            r_speeches: d.percent_of_r_speeches
        }
    };
    let totalInfo = {
        type: 'text',
        value: d.total
    }

    let dataList = [phraseInfo , frequencyInfo, percentagesInfo, totalInfo];
    
    return dataList;
}

function attachSortHandlers(data) 
    {
         //Attach click handlers to all the th elements inside the columnHeaders row.
         //Sort based on the column and alternate between ascending/descending.
        d3.selectAll('#columnHeaders th').on('click' , function(){
            var selectedColumn = d3.select(this).attr("id")
            let sortedlist;
            
            switch(selectedColumn){
                case 'Phrase':
                sortedlist = data.sort(function(a,b){
                    if (a.phrase > b.phrase) {
                        return 1;
                    } else if (a.phrase < b.phrase) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                if(headerData[0].ascending == true){
                    headerData[0].ascending = false;
                    sortedlist.reverse()
                }
                else{
                    headerData[0].ascending = true;
                }
                break;

                case 'Frequency':
                    sortedlist = data.sort(function(a,b) {
                        return (a.total) - (b.total);
                    })
                    if(headerData[1].ascending == true){
                        headerData[1].ascending = false;
                        sortedlist.reverse()
                    }
                    else{
                        headerData[1].ascending = true;
                    }
                break;

                case 'Percentage':
                    sortedlist = data.sort(function(a,b) {
                        return (a.total) - (b.total);
                    })
                    if(headerData[2].ascending == true){
                        headerData[2].ascending = false;
                        sortedlist.reverse()
                    }
                    else{
                        headerData[2].ascending = true;
                    }
                break;

                case 'Total':
                    sortedlist = data.sort(function(a,b) {
                        return (a.total) - (b.total);
                    })
                    if(headerData[3].ascending == true){
                        headerData[3].ascending = false;
                        sortedlist.reverse()
                    }
                    else{
                        headerData[3].ascending = true;
                    }
                break;

                default:

                break;

            }
            d3.selectAll('#NGramTableBody td').remove()
            drawTable(sortedlist)
        })        
    }

