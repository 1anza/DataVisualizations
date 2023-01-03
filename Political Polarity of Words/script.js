preGrouped = d3.json('./data/words.json');

//Loading the data
Promise.all([d3.csv('./data/words-without-force-positions.csv'), preGrouped]).then( data =>
    {
        let bubbleData = data[1];

        bubbleChart(bubbleData)
        AddTableHead()

        //sort data by category
        bubbleData = bubbleData.sort(function(a,b){
            if (a.category > b.category) {
                return 1;
            } else if (a.category < b.category) {
                return -1;
            } else {
                return 0;
            }
        })
    });