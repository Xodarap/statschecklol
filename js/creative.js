/*!
 * Start Bootstrap - Creative Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */
const cipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

    return text => text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}

const decipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}

async function ts(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(decipher('ben')('0b0c07') + message);                    

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}

window.ben = {};

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    })

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Fit Text Plugin for Main Header
    $("h1").fitText(
        1.2, {
            minFontSize: '35px',
            maxFontSize: '65px'
        }
    );

    // Offset for Main Navigation
    /*
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })
*/
    function cleanString(s) {
        return s.replace(' ','-').replace('(','-').replace(')','-').toLowerCase();
    }
    function generateTableHead(firstResponse) {
        var row = $('#headerRow')[0];
        var names = []
        for (var key in firstResponse) {
          let th = document.createElement("th");
          //th.setAttribute('data-field', cleanString(key));
          names.push(cleanString(key))
          let text = document.createTextNode(key + '⬘');
          th.appendChild(text);
          row.appendChild(th);
        }
        return names;
      }
    function generateTable(data) {
        generateTableHead(data[0]);
        var body = $('#tableBody')[0];
        for(let row of data) {
            let tr = document.createElement("tr");
            for (var key in row) {               
                let td = document.createElement("td");
                let text = document.createTextNode(row[key]);
                td.appendChild(text);
                tr.appendChild(td);
            }
            body.appendChild(tr);
        }
    }

    async function doSend() {
        var data = new FormData();
        var username = $('#username').val();
        if(username[0] == '@') { username = username.substring(1,99);}
        var url;
        if(false) {
            url = 'http://localhost:7071/api/classify?';
        }else {
            url = 'https://tiktok-fetch.azurewebsites.net/api/classify?code=r61Ga5aC8p6pthvMBlrbNdGLtQUZ13baT4lLz6rjhYYOqa6b9Wlhvw==';
        } 
        var tsv = await ts(username);
        url = url + '&name=' + username + '&ts=' + tsv;
        $.ajax({url: url, 
            data: data,
            type: 'POST',
            contentType: false,
            processData: false,
            success: function(result){
                $('#loaderHolder').hide();
                $('#resultsHolder').show();
                $('thead').html('<tr id="headerRow"></tr>');
                $('tbody').html('');
                generateTable(result);
                $('table').trigger('updateAll');
                initializePlot(result);
                doPlot(result);
            }           
        })
        return false;

    }
    // Initialize WOW.js Scrolling Animations
    new WOW().init();
    $('#submitButton').click((event) =>
    {
        event.preventDefault();
        $('#loaderHolder').show();
        doSend();
    }
    );
    function initializePlot(result) {
        window.ben = window.ben || {};
        window.ben.result = result;
        var s = $('select');
        s.html('');
        for (var key in result[0]) {
          let o = document.createElement("option");
          let text = document.createTextNode(key);
          o.appendChild(text);
          s.append(o);
        }
        $('#xChoice').val('Views');
        $('#yChoice').val('Likes');
    }
    function doPlot(result, xLabel = 'Views', yLabel = 'Likes'){
        var y = result.map(v => +v[yLabel])
        var x = result.map(v => +v[xLabel])
        var text = result.map(v => v['Description'])
        Plotly.newPlot( $('#graphHolder')[0], 
            [{
                x: x,
                y: y,
                text: text,
                type: 'scatter',
                mode: 'markers' }], 
            {
                margin:{t: 0},
                title: 'Video Data',
                xaxis: {
                    title: xLabel                      
                },
                yaxis: {
                    title: yLabel
                }
            } );
    }
    $('#xChoice, #yChoice').change(e => {
        doPlot(window.ben.result, $('#xChoice').val(), $('#yChoice').val());
    })
    $(document).ready(() =>  $('table').tablesorter());
    $(window).ready(() => {
    })
})(jQuery); // End of use strict
