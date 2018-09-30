/** =====================================
 * C3 Chart Active js
 * ===================================== **/
var colors = ['#ffce00', '#ffce00', '#ffce00', '#ffce00', '#ffce00', '#ffce00'];
var chart = c3.generate({
    bindto: '#chart',
    data: {
        columns: [
            ['data1', 30, 390, 350, 300, 170, 350],
            ['data2', 10, 20, 25, 35, 45, 55],
        ],
        axes: {
            data2: 'y2'
        },
        types: {
            data2: 'bar',
        },
        color: function (color, d) {
            return colors[d.index];
        }
    },
    grid: {
        y: {
            show: true,
            lines: [{value:0}]
        },
        x:{
            show: true,
            lines: [{value:-1}]
        }
    },
    bar: {
        width: {
            ratio: .6
        },

    },
    color: {
        pattern: ['#ffce00']
    },
    axis: {
        x: {
            type: 'category',
            categories: ['2009', '2010', '2011', '2012', '2013', '2014']
        }
    }

});