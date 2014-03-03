/*
 Flot plugin for rendering pie charts. The plugin assumes the data is
 coming is as a single data value for each series, and each of those
 values is a positive value or zero (negative numbers don't make
 any sense and will cause strange effects). The data values do
 NOT need to be passed in as percentage values because it
 internally calculates the total and percentages.

 * Created by Brian Medendorp, June 2009

 Available options are:
 series: {
 pie: {
 show: true/false
 radius: 0-1 for percentage of fullsize, or a specified pixel length, or 'auto'
 startAngle: 0-2 factor of PI used for starting angle (in radians) i.e 3/2 starts at the top, 0 and 2 have the same result
 offset: {
 top: integer value to move the pie up or down
 left: integer value to move the pie left or right, or 'auto'
 },
 stroke: {
 color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#FFF')
 width: integer pixel width of the stroke
 },
 label: {
 show: true/false, or 'auto'
 formatter:  a user-defined function that modifies the text/style of the label text
 radius: 0-1 for percentage of fullsize, or a specified pixel length
 background: {
 color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#000')
 opacity: 0-1
 },
 threshold: 0-1 for the percentage value at which to hide labels (if they're too small)
 },
 combine: {
 threshold: 0-1 for the percentage value at which to combine slices (if they're too small)
 color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#CCC'), if null, the plugin will automatically use the color of the first slice to be combined
 label: any text value of what the combined slice should be labeled
 }
 }
 }

 More detail and specific examples can be found in the included HTML
 file.

 */

(function($)
{
    function init(plot) // this is the "body" of the plugin
    {
        var canvas = null;
        var target = null;
        var maxRadius = null;
        var centerLeft = null;
        var centerTop = null;
        var total = 0;
        var redraw = true;
        var redrawAttempts = 10;
        var shrink = 0.95;
        var legendWidth = 0;
        var processed = false;

        // add hook to determine if pie plugin in enabled, and then perform necessary operations
        plot.hooks.processOptions.push(checkPieEnabled);

        // check to see if the pie plugin is enabled
        function checkPieEnabled(plot, options)
        {
            if (options.series.pie.show)
            {
                //disable grid
                options.grid.show = false;

                // set labels.show
                if (options.series.pie.label.show == 'auto')
                    if (options.legend.show)
                        options.series.pie.label.show = false;
                    else
                        options.series.pie.label.show = true;

                // set radius
                if (options.series.pie.radius == 'auto')
                    if (options.series.pie.label.show)
                        options.series.pie.radius = 3 / 4;
                    else
                        options.series.pie.radius = 1;

                // add processData hook to do transformations on the data
                plot.hooks.processDatapoints.push(processDatapoints);

                // add draw hook
                plot.hooks.draw.push(draw);
            }
        }

        // debugging function that prints out an object
        function alertObject(obj)
        {
            var msg = '';
            function traverse(obj, depth)
            {
                if (!depth)
                    depth = 0;
                for (var i in obj)
                {
                    for (var j = 0; j < depth; j++)
                        msg += '\t';

                    if (typeof obj[i] == "object")
                    {	// its an object
                        msg += '' + i + ':\n';
                        traverse(obj[i], depth + 1);
                    }
                    else
                    {	// its a value
                        msg += '' + i + ': ' + obj[i] + '\n';
                    }
                }
            }
            traverse(obj);
            alert(msg);
        }

        function calcTotal(data)
        {
            for (var i in data)
            {
                var item = parseFloat(data[i].data);
                if (item)
                    total += item;
            }
        }

        function processDatapoints(plot, series, data, datapoints)
        {
            if (!processed)
            {
                processed = true;

                canvas = plot.getCanvas();
                target = $(canvas).parent();
                options = plot.getOptions();

                plot.setData(combine(plot.getData()));
            }
        }

        function setupPie()
        {
            legendWidth = target.children().filter('.legend').children().width();

            // calculate maximum radius and center point
            maxRadius = Math.min(canvas.width, canvas.height) / 2;
            centerTop = (canvas.height / 2) + options.series.pie.offset.top;
            centerLeft = (canvas.width / 2);
            if (options.series.pie.offset.left == 'auto')
                if (options.legend.position.match('w'))
                    centerLeft += legendWidth;
                else
                    centerLeft -= legendWidth;
            else
                centerLeft += options.series.pie.offset.left;

            if (centerLeft < maxRadius)
                centerLeft = maxRadius;
            else if (centerLeft > canvas.width - maxRadius)
                centerLeft = canvas.width - maxRadius;
        }

        function combine(data)
        {
            calcTotal(data);
            var combined = 0;
            var color = options.series.pie.combine.color;

            var newdata = [];
            for (var i in data)
            {
                // make sure its a number
                data[i].data = parseFloat(data[i].data);
                if (!data[i].data)
                    data[i].data = 0;

                if (data[i].data / total <= options.series.pie.combine.threshold)
                {
                    combined += data[i].data;
                    if (!color)
                        color = data[i].color;
                }
                else
                {
                    newdata.push({
                        data: data[i].data,
                        color: data[i].color,
                        label: data[i].label,
                        angle: (data[i].data * (Math.PI * 2)) / total,
                        percent: (data[i].data / total * 100)
                    });
                }
            }
            if (combined > 0)
                newdata.push({
                    data: combined,
                    color: color,
                    label: options.series.pie.combine.label,
                    angle: (combined * (Math.PI * 2)) / total,
                    percent: (combined / total * 100)
                });
            return newdata;
        }

        function draw(plot, ctx)
        {
            setupPie();
            var slices = plot.getData();

            var attempts = 0;
            while (redraw && attempts < redrawAttempts)
            {
                redraw = false;
                if (attempts > 0)
                    maxRadius *= shrink;
                attempts += 1;
                clear();
                drawPie();
            }
            if (attempts >= redrawAttempts) {
                clear();
                target.prepend('<div class="error">Could not draw pie with labels contained inside canvas</div>');
            }

            if (plot.setSeries && plot.insertLegend)
            {
                plot.setSeries(slices);
                plot.insertLegend();
            }

            // we're actually done at this point, just defining internal functions at this point

            function clear()
            {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                target.children().filter('.pieLabel, .pieLabelBackground').remove();
            }

            function drawPie()
            {
                startAngle = Math.PI * options.series.pie.startAngle;

                // set radius
                if (options.series.pie.radius > 1)
                    var radius = options.series.pie.radius;
                else
                    var radius = maxRadius * options.series.pie.radius;

                // center and rotate to starting position
                ctx.save();
                ctx.translate(centerLeft, centerTop);
                //ctx.rotate(startAngle); // start at top; -- This doesn't work properly in Opera

                // draw slices
                ctx.save();
                var currentAngle = startAngle;
                for (var i in slices)
                    drawSlice(slices[i].angle, slices[i].color, true);
                ctx.restore();

                // draw slice outlines
                ctx.save();
                ctx.lineWidth = options.series.pie.stroke.width;
                currentAngle = startAngle;
                for (var i in slices)
                    drawSlice(slices[i].angle, options.series.pie.stroke.color, false);
                ctx.restore();

                // draw labels
                if (options.series.pie.label.show)
                    drawLabels();

                // restore to original state
                ctx.restore();

                function drawSlice(angle, color, fill)
                {
                    if (fill)
                        ctx.fillStyle = color;
                    else
                        ctx.strokeStyle = color;

                    ctx.beginPath();
                    if (angle != Math.PI * 2)
                        ctx.moveTo(0, 0); // Center of the pie
                    //ctx.arc(0,0,radius,0,angle,false); // This doesn't work properly in Opera
                    ctx.arc(0, 0, radius, currentAngle, currentAngle + angle, false);
                    ctx.closePath();
                    //ctx.rotate(angle); // This doesn't work properly in Opera
                    currentAngle += angle;

                    if (fill)
                        ctx.fill();
                    else
                        ctx.stroke();
                }

                function drawLabels()
                {
                    var currentAngle = startAngle;

                    // set radius
                    if (options.series.pie.label.radius > 1)
                        var radius = options.series.pie.label.radius;
                    else
                        var radius = maxRadius * options.series.pie.label.radius;

                    for (var i in slices)
                    {
                        if (slices[i].percent >= options.series.pie.label.threshold * 100)
                            drawLabel(slices[i], currentAngle, i);
                        currentAngle += slices[i].angle;
                    }

                    function drawLabel(slice, startAngle, index)
                    {
                        // format label text
                        var lf = options.legend.labelFormatter, text, plf = options.series.pie.label.formatter;
                        if (lf)
                            text = lf(slice.label, slice);
                        else
                            text = slice.label;
                        if (plf)
                            text = plf(text, slice);

                        var halfAngle = ((startAngle + slice.angle) + startAngle) / 2;
                        var x = centerLeft + Math.round(Math.cos(halfAngle) * radius);
                        var y = centerTop + Math.round(Math.sin(halfAngle) * radius);

                        var html = '<span class="pieLabel" id="pieLabel' + index + '" style="position:absolute;top:' + y + 'px;left:' + x + 'px;">' + text + "</span>";
                        target.append(html);
                        var label = target.children('#pieLabel' + index);
                        var labelTop = (y - label.height() / 2);
                        var labelLeft = (x - label.width() / 2);
                        label.css('top', labelTop);
                        label.css('left', labelLeft);

                        // check to make sure that the label is not outside the canvas
                        if (0 - labelTop > 0 || 0 - labelLeft > 0 || canvas.height - (labelTop + label.height()) < 0 || canvas.width - (labelLeft + label.width()) < 0)
                            redraw = true;

                        if (options.series.pie.label.background.opacity != 0) {
                            // put in the transparent background separately to avoid blended labels and label boxes
                            var c = options.series.pie.label.background.color;
                            if (c == null) {
                                c = slice.color;
                            }
                            var pos = 'top:' + labelTop + 'px;left:' + labelLeft + 'px;';
                            $('<div class="pieLabelBackground" style="position:absolute;width:' + label.width() + 'px;height:' + label.height() + 'px;' + pos + 'background-color:' + c + ';"> </div>').insertBefore(label).css('opacity', options.series.pie.label.background.opacity);
                        }
                    } // end individual label function
                } // end drawLabels function
            } // end drawPie function
        } // end draw function

    } // end init (plugin body)

    // define pie specific options and their default values
    var options = {
        series: {
            pie: {
                show: false,
                radius: 'auto', // actual radius of the visible pie (based on full calculated radius if <=1, or hard pixel value)
                startAngle: 3 / 2,
                offset: {
                    top: 0,
                    left: 'auto'
                },
                stroke: {
                    color: '#FFF',
                    width: 1
                },
                label: {
                    show: 'auto',
                    formatter: function(label, slice) {
                        return '<div style="font-size:x-small;text-align:center;padding:2px;color:' + slice.color + ';">' + label + '<br/>' + Math.round(slice.percent) + '%</div>';
                    }, // formatter function
                    radius: 1, // radius at which to place the labels (based on full calculated radius if <=1, or hard pixel value)
                    background: {
                        color: null,
                        opacity: 0
                    },
                    threshold: 0	// percentage at which to hide the label (i.e. the slice is too narrow)
                },
                combine: {
                    threshold: 0, // percentage at which to combine little slices into one larger slice
                    color: null, // color to give the new slice (auto-generated if null)
                    label: 'Other'	// label to give the new slice
                }
            }
        }
    };

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "pie",
        version: "0.3.1"
    });
})(jQuery);
