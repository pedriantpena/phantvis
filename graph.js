

console.log('Loading JS');

// Parse hash and load convenience URLs
$(function onReady() {
    setTimeout(function loadHashIfSpecified() {
        if(window.location.hash !== "") {
            let key = window.location.hash.replace('#', '');
            $('#key').val(key)
            generatePlot();
        }
    }, 100);
});

// Process Phant data to highchart types
function processData(dataIn) {
    dataIn = dataIn.reverse();

    // Flatten data
    let flattened = {};
    for(let i =0; i<dataIn.length; i++) {
        let entry = dataIn[i];
        for(let type in entry) {
            let val = entry[type];
            if(typeof flattened[type] === 'undefined') flattened[type] = [];
            if(type !== 'timestamp') {
                flattened[type].push([new Date(entry['timestamp']).getTime(), parseFloat(val)]);
            }
        }
    }

    // Build datasets for highcharts
    let datasets = [];
    let yAxis = [];
    for(let index in flattened) {
        if(index !== 'timestamp') {
            let dataset = {
                type: 'spline',
                name: index,
                data: flattened[index],
            }
            if(yAxis.length > 0) {
                dataset.yAxis = yAxis.length
            }
            datasets.push(dataset)
            let axis = {
                gridLineWidth: 0,
                labels: {
                    format: '{value}',
                },
                title: {
                    text: index,
                }
            }
            yAxis.push(axis);
        }
    }

    let data = {
        labels: flattened['timestamp'],
        datasets: datasets,
        yAxis: yAxis
    }

    return data;
}

// Display data
function handleData(key, data, status) {

    $("#loading").toggleClass('hidden', true);
    $("#plotDiv").toggleClass('hidden', false);

    if(status !== 'success') {
        return handleError(status);
    }

    $('#result').empty();
    $('#result').toggleClass('hidden', false);
    $('#result').toggleClass('alert-success', false);
    $('#result').toggleClass('alert-danger', false);
    $('#result').append('<p>Check out the raw stream <a href="https://data.sparkfun.com/streams/' + key + '">here</a> or bookmark this chart <a href=./#' + key + '>here</a></p>');

    var chartData = processData(data);

    Highcharts.setOptions({
        global : {
            useUTC : false
        }
    });

    let chart = $('#plot').highcharts({
        chart: {
            type: 'spline',
            zoomType: 'x'
        },
        title: {
            text: 'Phantvis'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: chartData.yAxis,
        series: chartData.datasets,
        tooltip: {
            shared: true
        },
        rangeSelector: {
            enabled: true,
            buttons: [{
                type: 'hour',
                count: 1,
                text: '1h'
            }, {
                type: 'day',
                count: 1,
                text: '1d'
            }, {
                type: 'week',
                count: 1,
                text: '1w'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'ytd',
                text: 'YTD'
            }, {
                type: 'year',
                count: 1,
                text: '1y'
            }, {
                type: 'all',
                text: 'All'
            }]
        }
    });
}

// Display an error alert with the provided message
function handleError(error) {
    $('#loading').toggleClass('hidden', true);
    $('#result').toggleClass('hidden', false);
    $('#result').empty();
    $('#result').toggleClass('alert-success', false);
    $('#result').toggleClass('alert-danger', true);
    $('#result').append('<p>error :' + error + ' fetching data</p>');
}

// Form logic
var generatePlot = function generatePlot(e) {
    if(typeof e !== 'undefined') e.preventDefault();
    
    // Fetch key and push to window hash
    var key = $('#key').val()
    window.location.hash = '#' + key;

    // Hide result
    $('#result').toggleClass('hidden', true);

    // Display loading animation
    $("#loading").toggleClass('hidden', false);

    // Fetch JSON data
    let url = 'https://data.sparkfun.com/output/' + key + '.json';

    $.getJSON(url, function(data, status) {
        handleData(key, data, status);
    })
    .fail(function(error) {
        console.log(error);
        handleError(error.statusText)
    });
}

// Bind plot to form submission
$("#graphForm").submit(generatePlot);


// Google tracking
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-84661228-1', 'auto');
ga('send', 'pageview');


