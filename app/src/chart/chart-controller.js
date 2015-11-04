///*global angular, Spinner, dc, crossfilter */
//angular.module('voyager.search')
//    .controller('ChartCtrl', function ($scope, $http, config) {
//
//        'use strict';
//
//        //var barChart;
//        //var formatChart;
//        var operatorChart;
//        var fieldsChart;
//        var producingChart;
//        var statusChart;
//        var typeChart;
//        var depthDimension;
//        //var dimension;
//        //var group;
//
//        $scope.depth = {min:0, max:0};
//        $scope.maxDepth = 0;
//
//        $scope.resetChart = function (chart) {
//            eval(chart + '.filterAll()');  // jshint ignore:line
//            dc.redrawAll();
//        };
//
//        var spinner = new Spinner().spin();
//        var loadingContainer = $('#initialLoadContainer');
//        loadingContainer.append(spinner.el);
//
//        var service = config.chartData;
//
//        $http.jsonp(service).then(function(res) {
//            load(res.data);
//        });
//
//        function load(data) {
//
//            var docs = data.response.docs;
//
//            //remove junk
//            for(var i = docs.length -1; i >= 0 ; i--){
//
//                //console.log(docs[i].meta_Field_Name);
//                if(_.isEmpty(docs[i]) || angular.isUndefined(docs[i].meta_Field_Name) || docs[i].meta_Field_Name[0] === ' '){
//                    //console.log('2 - ' + docs[i].meta_Field_Name);
//                    docs.splice(i, 1);
//                }
//
//                if(angular.isDefined(docs[i]) && angular.isDefined(docs[i].meta_Operator) && docs[i].meta_Operator[0] === ' '){
//                    //console.log('2 - ' + docs[i].meta_Field_Name);
//                    docs[i].meta_Operator[0] = 'NA';
//                }
//
//                if(angular.isDefined(docs[i]) && angular.isDefined(docs[i].meta_Producing) && docs[i].meta_Producing[0] === ' '){
//                    //console.log('2 - ' + docs[i].meta_Field_Name);
//                    docs[i].meta_Producing[0] = 'NA';
//                }
//
//                if(angular.isDefined(docs[i])) {
//
//                    if (docs[i].fl_Well_Depth > $scope.maxDepth) {
//                        $scope.maxDepth = docs[i].fl_Well_Depth;
//                    }
//
//                    if(angular.isDefined(docs[i].meta_Operator)) {
//                        docs[i].meta_Operator = docs[i].meta_Operator.toString();
//                    }
//                    if(angular.isDefined(docs[i].meta_Field_Name)) {
//                        docs[i].meta_Field_Name = docs[i].meta_Field_Name.toString();
//                    }
//                    if(angular.isDefined(docs[i].meta_Producing)) {
//                        docs[i].meta_Producing = docs[i].meta_Producing.toString();
//                    }
//                    if(angular.isDefined(docs[i].meta_Well_Statu)) {
//                        docs[i].meta_Well_Statu = docs[i].meta_Well_Statu.toString();
//                    }
//                    if(angular.isDefined(docs[i].meta_Well_Type)) {
//                        docs[i].meta_Well_Type = docs[i].meta_Well_Type.toString();
//                    }
//                }
//
//            }
//
//            $scope.depth.max = $scope.maxDepth;
//
//            //var dateFormat = d3.time.format('%Y-%m-%d');
////                data.forEach(function(e) {
////                    var m = e.modified.split('T')[0];
////                    e.dd = dateFormat.parse(m);
////                    if(e.dd === null) {
////                        e.dd = new Date();
////                    }
////                    if(e.bytes == null || e.bytes === '') {
////                        e.bytes = 0;
////                    }
////                });
//
//            // feed it through crossfilter
//            var ndx = crossfilter(docs);
//
//            // field dimension
//            var fields = ndx.dimension(function (d) {
//                return d.meta_Field_Name;
//            });
//
//            var fieldsGroup = fields.group();
//
//            var operators = ndx.dimension(function (d) {
//                return d.meta_Operator;
//            });
//
//            var operatorsGroup = operators.group();
//
//            var producing = ndx.dimension(function (d) {
//                return d.meta_Producing;
//            });
//
//            var producingGroup = producing.group();
//
//            var status = ndx.dimension(function (d) {
//                return d.meta_Well_Statu;
//            });
//
//            var statusGroup = status.group();
//
//            var type = ndx.dimension(function (d) {
//                return d.meta_Well_Type;
//            });
//
//            var typeGroup = type.group();
//
////                var formatGroup = format.group().reduceSum(function (d) {
////                    return d.bytes;
////                });
//
//            // define group all for counting
//            var all = ndx.groupAll();
//
//            // define a dimension
////                dimension = ndx.dimension(function(d) {
////                    return d3.time.month(d.dd);
////                });
//            depthDimension = ndx.dimension(function (d) {
//                return d.fl_Well_Depth;
//            });
//
//            // map/reduce to group sum
//            //group = dimension.group().reduceSum(function(d) { return d.bytes; });
//            //group = dimension.group().
//            //createRowChart(format,formatGroup);
//            fieldsChart = createPieChart('#fields-chart',fields,fieldsGroup);
//            operatorChart = createPieChart('#operator-chart',operators,operatorsGroup);
//            producingChart = createPieChart('#producing-chart',producing,producingGroup);
//            statusChart = createPieChart('#status-chart',status,statusGroup);
//            typeChart = createPieChart('#type-chart',type,typeGroup);
//            //createBarChart(depthDimension, depthDimension.group());
//
//            //createChart(dimension, group);
//            createDataTable(fields,fieldsGroup);
//
//            dc.dataCount('.dc-data-count')
//                .dimension(ndx)
//                .group(all);
//
//            dc.renderAll();
//
//            spinner.stop();
//            $('#chart-info').show();
//        }
//
//        //function createBarChart(dimension, group) {
//        //    barChart = dc.barChart('#well-chart');
//        //    barChart
//        //        .width(768)
//        //        .height(50)
//        //        .x(d3.scale.linear().domain([100,13500]))
//        //        .brushOn(false)
//        //        .dimension(dimension)
//        //        .group(group)
//        //    return barChart;
//        //}
//
//        //function createChart(dimension, group) {
//        //    /* Create a bar chart and use the given css selector as anchor. You can also specify
//        //     * an optional chart group for this chart to be scoped within. When a chart belongs
//        //     * to a specific group then any interaction with such chart will only trigger redraw
//        //     * on other charts within the same chart group. */
//        //    barChart = dc.barChart('#my-chart')
//        //        .width(900) // (optional) define chart width, :default = 200
//        //        .height(500) // (optional) define chart height, :default = 200
//        //        .transitionDuration(500) // (optional) define chart transition duration, :default = 500
//        //        // (optional) define margins
//        //        .margins({top: 10, right: 10, bottom: 30, left: 100})
//        //        .dimension(dimension) // set dimension
//        //        .group(group) // set group
//        //        // (optional) whether chart should rescale y axis to fit data, :default = false
//        //        .elasticY(true)
//        //        // (optional) when elasticY is on whether padding should be applied to y axis domain, :default=0
//        //        .yAxisPadding(10)
//        //        // (optional) whether chart should rescale x axis to fit data, :default = false
//        //        .elasticX(true)
//        //        // (optional) when elasticX is on whether padding should be applied to x axis domain, :default=0
//        //        .xAxisPadding(500)
//        //        // define x scale
//        //        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2014, 11, 31)]))
//        //        // (optional) set filter brush rounding
//        //        .round(d3.time.month.round)
//        //        // define x axis units
//        //        .xUnits(d3.time.months)
//        //        // (optional) whether bar should be center to its x value, :default=false
//        //        .centerBar(true)
//        //        // (optional) set gap between bars manually in px, :default=2
//        //        //.barGap(1)
//        //        // (optional) render horizontal grid lines, :default=false
//        //        .renderHorizontalGridLines(true)
//        //        // (optional) render vertical grid lines, :default=false
//        //        .renderVerticalGridLines(true)
//        //        // (optional) add stacked group and custom value retriever
//        //        //   .stack(monthlyMoveGroup, function(d){return d.value;})
//        //        // (optional) you can add multiple stacked group with or without custom value retriever
//        //        // if no custom retriever provided base chart's value retriever will be used
//        //        //   .stack(monthlyMoveGroup)
//        //        // (optional) whether this chart should generate user interactive brush to allow range
//        //        // selection, :default=true.
//        //        .brushOn(true)
//        //        .yAxisLabel('Bytes')
//        //    //.legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
//        //    // (optional) whether svg title element(tooltip) should be generated for each bar using
//        //    // the given function, :default=no
//        //    //.title(function(d) { return 'Value: ' + d.value; })
//        //    // (optional) whether chart should render titles, :default = false
//        //    //.renderTitle(true);
//        //
//        //}
//
//        function createPieChart(id, dimension, group) {
//            var chart = dc.pieChart(id);
//            chart.width(220)
//                .height(200)
//                .radius(80)
//                .innerRadius(20)
//                .dimension(dimension)
//                .legend(dc.legend().x(900).y(10).itemHeight(13).gap(5))
//                .group(group,'blah');
//
//            return chart;
//        }
//
////        function createRowChart(dimension, group) {
//////            var formatChart = dc.rowChart('#format-chart');
//////            formatChart.width(180)
//////                    .height(400)
//////                   // .margins({top: 20, left: 10, right: 10, bottom: 20})
//////                    .group(group)
//////                    .dimension(dimension)
//////                // assign colors to each value in the x scale domain
//////                    //.ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
//////                    .label(function (d) {
//////                        return d.key;
//////                    })
//////                // title sets the row text
//////                    .title(function (d) {
//////                        return d.value;
//////                    })
//////                    //.legend(dc.legend().x(250).y(10))
//////                    .elasticX(true)
//////                    .xAxis()
//////                    .ticks(4);
//
//        //    var groupWrapper = {
//        //        all:function () {
//        //            return group.all().filter(function(d) {
//        //                return d.value !== 0;
//        //            });
//        //        }
//        //    };
//        //
//        //    formatChart = dc.rowChart('#format-chart')
//        //        .width(550).height(500)
//        //        .margins({top: 10, left: 0, right: 20, bottom: 30})
//        //        .dimension(dimension)
//        //        .group(groupWrapper)
//        //        .elasticX(true)
//        //        //.gap(7)
//        //        .label(function(t) {
//        //            return t.key;
//        //        })
//        //        .title(function(t){
//        //            return t.value;
//        //        })
//        //        .renderLabel(!0)
//        //        .xAxis()
//        //        .ticks(2);
//        //}
//
//        function createDataTable(dimension) {
//            dc.dataTable('.dc-data-table')
//                .dimension(dimension)
//                // data table does not use crossfilter group but rather a closure
//                // as a grouping function
//                .group(function (d) {
//                    //var format = d3.format('02d');
//                    //return d.dd.getFullYear() + '/' + format((d.dd.getMonth() + 1));
//                    //return format((d.dd.getMonth() + 1))  + '/' + d.dd.getFullYear();
//                    return d.meta_Well_Type;
//                })
//                .size(1000) // (optional) max number of records to be shown, :default = 25
//                // dynamic columns creation using an array of closures
//                .columns([
//                    function (d) {
//                        return d.name;
//                    },
//                    function (d) {
//                        return d.meta_Field_Name;
//                    },
//                    function (d) {
//                        return d.meta_Operator;
//                    },
//                    function (d) {
//                        return d.meta_Producing;
//                    },
//                    function (d) {
//                        return d.meta_Well_Statu;
//                    },
//                    function (d) {
//                        return d.meta_Well_Type;
//                    },
//                    function (d) {
//                        return d.fl_Well_Depth;
//                    }
//
//                ])
//                // (optional) sort using the given field, :default = function(d){return d;}
////                    .sortBy(function (d) {
////                        return d.dd;
////                    })
//                // (optional) sort order, :default ascending
//                //   .order(d3.ascending)
//                // (optional) custom renderlet to post-process chart using D3
//                .renderlet(function (table) {
//                    table.selectAll('.dc-table-group').classed('info', true);
//                });
//        }
//
//        $('#change-depth').click(function(){
//            depthDimension.filter([1000, 2000]);
//            //tripVolume.x(d3.time.scale().domain([minDate,maxDate]));
//
//            //console.log(tripVolume.filters());
//
//            dc.redrawAll();
//        });
//
//        $scope.slide = function() {
//            depthDimension.filter([$scope.depth.min, $scope.depth.max]);
//            dc.redrawAll();
//        };
//
//    });