

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

// URL
var URLProtocolRegEx = new RegExp("^(\\w+:\\/\\/)");

function URLProtocolToLowerCase(url) {
    if (URLProtocolRegEx.test(url)) {
        return url.replace(URLProtocolRegEx, (URLProtocolRegEx.exec(url)[0]).toLowerCase());
    } else {
        return url;
    }
}

function getURL() {
    return URLProtocolToLowerCase($('#url').val()).trim();
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var testData = [{"pressure":"1004.749","temperature":"25.527","humidity":"49.53","timestamp":"2016-09-23T07:45:12.709Z"},{"pressure":"1004.719","temperature":"25.587","humidity":"49.47","timestamp":"2016-09-23T07:35:05.482Z"},{"pressure":"1004.665","temperature":"25.675","humidity":"49.32","timestamp":"2016-09-23T07:24:56.049Z"},{"pressure":"1004.642","temperature":"25.719","humidity":"49.37","timestamp":"2016-09-23T07:14:52.329Z"}];



function getDateMs(t) {
    return new Date(t).getTime();
}

function subsampleData(rawData, startTime, endTime, count) {
    let startIndex = 0;
    let endIndex = rawData.length;

    // Find index for start time
    for(let i = 0; i < rawData.length; i++) {
        let t = rawData[i].timestamp;
        if(getDateMs(t) >= getDateMs(startTime)) {
            startIndex = i;
            break;
        }
    }

    // Find index for end time
    for(let i = 0; i < rawData.length; i++) {
        let t = rawData[i].timestamp;
        if(getDateMs(t) > getDateMs(endTime)) {
            endIndex = i;
            break;
        }
    }

    console.log("Start index: " + startIndex + " end index: " + endIndex);
    let sliceCount = endIndex - startIndex;

    let subsample = rawData.slice(startIndex, endIndex);

    return subsample;
}

function processData(dataIn) {

    dataIn = dataIn.reverse();

    // Flatten data
    let flattened = {};
    for(let i =0; i<dataIn.length; i++) {
        let entry = dataIn[i];
        for(let type in entry) {
            let val = entry[type];
            if(typeof flattened[type] === 'undefined') flattened[type] = [];
            flattened[type].push(val);
        }
    }

    // Build datasets for chart.js
    let datasets = [];
    let yAxes = [];
    let colorCount = 0;
    for(let index in flattened) {
        if(index !== 'timestamp') {
            let axisId = "y-axis-" + index;

            let dataset = {
                label: index,
                data: flattened[index],
                pointRadius: 0,
                cubicInterpolationMode: 'default',
                fill: false,
                spanGaps: false,
                backgroundColor: colors[colorCount % colors.length],
                borderColor: colors[colorCount % colors.length],
                yAxisID: axisId
            }
            colorCount += 1;
            datasets.push(dataset);

            let axis = {type: "linear", "id": axisId, display: true, labe: index, position: "left"};
            yAxes.push(axis);
        }
    }

    let data = {
        labels: flattened['timestamp'],
        datasets: datasets,
        startTime: dataIn[0].timestamp,
        endTime: dataIn[dataIn.length-1].timestamp,
        count: dataIn.length,
        yAxes: yAxes
    }

    return data;
}

var numSamples = 100;

var rawData = {};
var chartData = {};

var colors = ['rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)']

// Form logic
var generatePlot = function generatePlot(e) {
    if(typeof e !== 'undefined') e.preventDefault();
    var key = $('#key').val()
    window.location.hash = '#' + key;

    var $result = $("#result");
    $result.toggleClass('hidden', true);

    $.get('https://data.sparkfun.com/output/' + key + '.json', function(data, status) {
        // Show result object
        $result.toggleClass('hidden', false);

        rawData = data;
        chartData = processData(data);

        var chartOptions = {
            scales: {
                xAxes: [{
                    type: 'time',
                    position: 'bottom'
                }],
                yAxes: chartData.yAxes
            }
        }

        console.log(chartData);

        var ctx = $("#plot");

        var myChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });

   });

    function boop (data, status) {
        $result.toggleClass('hidden', false);

        if (data.result == 'okay') {
            $result.empty();
            $result.toggleClass('alert-success', true);
            $result.toggleClass('alert-danger', false);
            
            var emojiUrl = data.emoji_url;
            if (!Modernizr.emoji_old) {
                emojiUrl = emoji.parseEmoji(emojiUrl);
            }
            
            $result.append('<p><strong>Your Link:</strong> <a href="/' + data.emoji_url + '">moji.li/' + emojiUrl + '</a></p>');
        } else {
            $result.empty();
            $result.toggleClass('alert-success', false);
            $result.toggleClass('alert-danger', true);
            $result.append('<p>' + data.message + '</p>');
        }
    }
}

$("#graphForm").submit(generatePlot);

