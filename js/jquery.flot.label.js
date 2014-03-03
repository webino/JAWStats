/*
 Flot plugin for labeling inside the graph
 Asaf Ohaion, asaf at Lingnu.com
 */

(function($) {
    var options = {series: {labels: null}}; // or array

    function init(plot) // this is the "body" of the plugin
    {
        function checkLabelEnabled(plot, options) {
            if (options.series.labels) {
                plot.hooks.draw.push(drawLabels);
            }
        }

        function drawLabels(plot, canvascontext) {
            var series = plot.getData()[0];
            var data = series.data;
            var labels = series.labels;
            var target = plot.getPlaceholder();

            for (var i = 0; i < data.length; i++) {
                var point = plot.pointOffset({x: data[i][0], y: data[i][1]});
                var html = '<span class="barLabel" style="color:grey;position:absolute;top:' + (data[i][1] < 10 ? point.top - 9 : point.top + 7) + 'px;left:' + (point.left + 7) + 'px;">' + labels[i] + "</span>";
                target.append(html);
            }
        }
        plot.hooks.processOptions.push(checkLabelEnabled);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'label',
        version: '1.0'
    });
})(jQuery);
