/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
        // add useful attributes
        for (let forecast of this.tableData)
        {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'mean_netpartymargin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winner_Rparty',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);

        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
        ////////////
        // PART 2 //
        ////////////
        /**
         * Draw the legend for the bar chart.
         */

        var marginSVG = d3.select('#marginAxis').attr('width' ,this.vizWidth ).attr('height' ,this.vizHeight)
      
        marginSVG.selectAll('text')
        .data([-75,-50,-25, 25 , 50 , 75])
        .enter()
        .append('text')
        .attr('y' , 25)
        .attr('x' , d=>{return this.scaleX(d)})
        .text(d=>{return '+'+Math.abs(d)})
        .attr('text-anchor' , 'middle')
        .attr("font-size", "12px")
        .attr("fill", function(d){
            if (d<0) return "steelblue"
            else return "firebrick"
        })

    }

    drawTable() {
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.on('click', (event, d) => 
            {
                if (d.isForecast)
                {
                    this.toggleRow(d, this.tableData.indexOf(d));
                }
            });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', d => d.class)
            .text(function(d){
                if(d.type == 'text')
                return d.value
            })
         ////////////
        // PART 1 // 
        ////////////
        /**
         * with the forecastSelection you need to set the text based on the dat value as long as the type is 'text'
         */


        let vizSelection = forecastSelection.filter(d => d.type === 'viz');

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');

        this.addGridlines(grouperSelect.filter((d,i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d,i) => i === 1));
        this.addCircles(grouperSelect.filter((d,i) => i === 2));
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: -d.p90_netpartymargin,
                margin: d.isForecast ? -(+d.mean_netpartymargin) : d.margin,
                marginHigh: -d.p10_netpartymargin,
            }
        };

        let winChance;
        if (d.isForecast)
        {
            const trumpWinChance = +d.winner_Rparty;
            const bidenWinChance = +d.winner_Dparty;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100)
            {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else
        {
            winChance = {type: 'text', class: '', value: ''}
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList)
        {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders(column , cell) {
        ////////////
        // PART 7 // 
        ////////////
        /**
         * update the column headers based on the sort state
         */
        d3.selectAll('i').attr('class' , 'fas no-display')
        switch(column){
            case 'State ':
                if(this.headerData[0].ascending == true) d3.select(cell).select('i').attr('class' , 'fa fa-sort-up')
                else if(this.headerData[0].ascending == false)
                d3.select(cell).select('i').attr('class' , 'fa fa-sort-down')
               
            break;

            case 'Margin of Victory ':
                if(this.headerData[1].ascending == true) d3.select(cell).select('i').attr('class' , 'fa fa-sort-up')
                else if(this.headerData[1].ascending == false)
                d3.select(cell).select('i').attr('class' , 'fa fa-sort-down')
                
            break;

            default:

            break;

        }
        d3.selectAll('#columnHeaders th').classed('sorting' , false)
        d3.select(cell).classed('sorting' , true)

     
    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
         */

        containerSelect.call(d3.axisBottom(this.scaleX)
        .tickValues(ticks)
            .tickSize(this.vizHeight)
            .tickFormat("")
        )
        d3.selectAll('path').remove()

    }

    addRectangles(containerSelect) {
        ////////////
        // PART 4 // 
        ////////////
        /**
         * add rectangles for the bar charts
         */
        function between(x, min, max) {
            return x >= min && x <= max;
          }
        var oneBar = containerSelect.filter((d,i) => { if((between(0,d.value.marginLow , d.value.marginHigh) == false) && d.isForecast == true)
            return d}
        )
        var twoBars = containerSelect.filter((d,i) => {if((between(0,d.value.marginLow , d.value.marginHigh) == true) && d.isForecast == true)
            return d}
        )

        oneBar.append('rect')
        .attr('x' , d=>{return this.scaleX(d.value.marginLow)})
        .attr('y' , 10)
        .attr('width' , d=>{if(d.value.marginLow<0)
            return (this.scaleX(Math.abs(d.value.marginLow))-this.scaleX(Math.abs(d.value.marginHigh)))
        else
        return (this.scaleX(Math.abs(d.value.marginHigh))-this.scaleX(Math.abs(d.value.marginLow)))})
        .attr('height' , 20)
        .attr("fill", function(d){ return d.value.marginLow < 0 ? "steelblue": "firebrick"; })
        .style('opacity' , 0.6)

        twoBars.append('rect')
        .attr('x' , d=>{return this.scaleX(0)})
        .attr('y' , 10)
        .attr('width' , d=>{return (this.scaleX(d.value.marginHigh) - this.scaleX(0))})
        .attr('height' , 20)
        .attr("fill", "firebrick" )
        .style('opacity' , 0.6)
       
        twoBars.append('rect')
        .attr('x' , d=>{return this.scaleX(d.value.marginLow)})
        .attr('y' , 10)
        .attr('width' , d=>{return (this.scaleX(0) - this.scaleX(d.value.marginLow))})
        .attr('height' , 20)
        .attr("fill", "steelblue" )
        .style('opacity' , 0.6)

    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */

         var largeCircles = containerSelect.filter((d,i) => { if(d.isForecast == true)
            return d}
        )
        var smallCircles = containerSelect.filter((d,i) => {if(d.isForecast == undefined)
            return d}
        )

        largeCircles.append("circle")
        .attr('cx' , d=>{return this.scaleX(d.value.margin)} )
        .attr('cy' , 20)
        .attr("r",5)
        .attr('fill' ,function(d){ return d.value.margin < 0 ? "steelblue": "firebrick"; })
        .attr("fill-opacity",0.8)
        .attr('stroke' ,function(d){ return d.value.margin < 0 ? "steelblue": "firebrick"; })
        .attr("stroke-opacity","1")
        .style("stroke-width","2px");

        smallCircles.append("circle")
        .attr('cx' , d=>{return this.scaleX(d.value.margin)} )
        .attr('cy' , 10)
        .attr("r",2)
        .attr('fill' ,function(d){ return d.value.margin < 0 ? "steelblue": "firebrick"; })
        .attr("fill-opacity",0.8)
        .attr('stroke' ,function(d){ return d.value.margin < 0 ? "steelblue": "firebrick"; })
        .attr("stroke-opacity","1")
        .style("stroke-width","2px");

      
    }

    attachSortHandlers() 
    {
        ////////////
        // PART 6 // 
        ////////////
        /**
         * Attach click handlers to all the th elements inside the columnHeaders row.
         * The handler should sort based on that column and alternate between ascending/descending.
         */
        let self = this;
        d3.selectAll('#columnHeaders th').on('click' , function(){
            self.collapseAll();
            let toSortlist = self.tableData
           
            let sortedlist;
            
            switch(this.textContent){
                case 'State ':
                sortedlist = toSortlist.sort(function(a,b){
                    if (a.state > b.state) {
                        return 1;
                    } else if (a.state < b.state) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                if(self.headerData[0].ascending == true){
                    self.headerData[0].ascending = false;
                    sortedlist.reverse()
                }
                else{
                    self.headerData[0].ascending = true;
                }
                break;

                case 'Margin of Victory ':
                    sortedlist = toSortlist.sort(function(a,b) {
                        return Math.abs(a.mean_netpartymargin) - Math.abs(b.mean_netpartymargin);
                    })
                    if(self.headerData[1].ascending == true){
                        self.headerData[1].ascending = false;
                        sortedlist.reverse()
                    }
                    else{
                        self.headerData[1].ascending = true;
                    }
                break;

                default:

                break;

            }
            d3.selectAll('#predictionTableBody td').remove()
            self.drawTable()
            self.updateHeaders(this.textContent, this)
        })        
    }

  


    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */

        let dataset = this.pollData
        var data = new Map([...dataset].filter(([k, v])=>k===rowData.state))
        let values
        data.forEach(function(d){ values = d })

        if(rowData.isExpanded == false)
        {
            this.tableData = this.tableData.slice(0, index+1).concat(values).concat(this.tableData.slice(index+1)) 
            rowData.isExpanded = true;
        }
        else{
            this.tableData = this.tableData.slice(0, index+1).concat(this.tableData.slice(values.length+index+1, this.tableData.length))
            rowData.isExpanded = false;
        }

        d3.selectAll('#predictionTableBody td').remove()
        this.drawTable()

     
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}
