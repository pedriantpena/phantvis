

console.log('Loading JS');


$(function onReady() {
    setTimeout(function loadHashIfSpecified() {
        if(window.location.hash !== "") {
            let key = window.location.hash.replace('#', '');
            $('#key').val(key)
            generatePlot();
        }
    });
});

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

var chartData = {};

// Form logic
var generatePlot = function generatePlot(e) {
    if(typeof e !== 'undefined') e.preventDefault();
    var key = $('#key').val()
    window.location.hash = '#' + key;

    var $result = $("#result");
    $result.toggleClass('hidden', true);

    $("#loading").toggleClass('hidden', false);

    $.getJSON('https://data.sparkfun.com/output/' + key + '.json', function(data, status) {
        $("#loading").toggleClass('hidden', true);
        $("#plotDiv").toggleClass('hidden', false);

        chartData = processData(data);

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

        function SetZoom(start, end) {
            chart.xAxis[0].setExtremes(
                new Date(start),
                new Date(end)
            );
        }

    });
}

$("#graphForm").submit(generatePlot);

