(function () {
    "use strict";

    angular.module("app.jv-pack.directive", [])
        .directive("jvPack", jvPack);

    jvPack.$inject = ["_", "$compile", "$filter", "widgetConfigService", 'VIZ_COLORS'];

    function jvPack(_, $compile, $filter, widgetConfigService, VIZ_COLORS) {

        jvPackLink.$inject = ["scope", "ele", "attrs", "controllers"];
        jvPackCtrl.$inject = ["$scope"];

        return {
            restrict: "A",
            require: ['chart'],
            priority: 300,
            link: jvPackLink,
            controller: jvPackCtrl
        };

        function jvPackLink(scope, ele, attrs, ctrl) {
            //initialize and declare scope variables
            scope.chartController = ctrl[0];

            var jvPackChart;

            var dirtyData, localChartData, localChartDataTableAlign, localChartDataTypes, localChartDataTypesCount, painted, paintedTypes, paintedTypesCount;

            var axis, viz, box, boxWidth, w, h, dateFormat, dateTicks, timeScale, globalStartTime, globalStartTimeValues, globalEndTime, globalEndTimeValues, colorScale, barHeight = 20, gap = 4, axisHeight = 25, labelPadding = 150, rectPadding = 35;

            //inserting div to allow c3 to bind
            var html = '<div id=' + scope.chartController.chartName + "-append-viz" + '><div id=' + scope.chartController.chartName + '></div></div>';
            ele.append($compile(html)(scope));

            //widget variables
            scope.chartController.margin = {
                top: 20,
                right: 40,
                bottom: 150,
                left: 40
            };

            scope.chartController.SHOW_SOCIAL_SHARING = false;
            //Widget Functions
            scope.chartController.dataProcessor = function (newData) {

                var localChartData = JSON.parse(JSON.stringify(newData));



                //filter dataTable
                for (var k in  localChartData.dataTableAlign) {
                    localChartData.dataTableAlign[k] = $filter("shortenAndReplaceUnderscores")(localChartData.dataTableAlign[k]);
                }

                //Grab uiOptions from Viz Services if they do not exist
                if (_.isEmpty(localChartData.uiOptions)) {
                    localChartData.uiOptions = widgetConfigService.getDefaultToolOptions('Pack');
                }


                scope.chartController.chartDiv.attr('class', 'full-width full-height chart-div absolute-size');

                scope.chartController.container = newData.panelSize;

                var tipConfig = {
                    type: "simple"
                };
                //create jv chart object
                jvPackChart = new jvCharts({
                    type: "jvPack",
                    name: scope.chartController.chartName,
                    options: localChartData.uiOptions,
                    chartDiv: scope.chartController.chartDiv,
                    tipConfig: tipConfig
                });

                var headers = [];
                if (newData.dataTableAlign) {
                    for (var header in newData.dataTableAlign) {
                        headers.push(newData.dataTableAlign[header]);
                    }
                } else {
                    for (var header in newData.headers) {
                        headers.push(newData.headers[header].title);
                    }
                }

                localChartData.treeData = processTableData(JSON.parse(JSON.stringify(newData.filteredData)), headers);

                if(localChartData.uiOptions.colorName === 'Custom'){
                    var colorScheme = [];
                    for(var color in localChartData.uiOptions.color){
                        colorScheme.push(localChartData.uiOptions.color[color]);
                    }
                    jvPackChart.setPackChartData(localChartData.treeData, localChartData.dataTableAlign, colorScheme);
                } else {
                    var temp = "COLOR_" + localChartData.uiOptions.colorName.toUpperCase();
                    //Set jvPack chart data here
                    jvPackChart.setPackChartData(localChartData.treeData, localChartData.dataTableAlign, VIZ_COLORS[temp]);
                }

                //Call update function to draw pack
                update();
            };

            scope.chartController.highlightSelectedItem = function (selectedItem) {

            };


            scope.chartController.filterAction = function () {

            };

            scope.chartController.resizeViz = function () {
                update();
            };

            //pass in all of the tabular data and the selected levels (dataTableAlign); we will set up the tree data according to the order of the data table align
            function processTableData(data, tableHeaders) {
                var allHash = {}, list = [], rootMap = {}, currentMap = {};

                for (var i in data) { //all of this is to change it to a tree structure and then call makeTree to structure the data appropriately for this viz
                    var count = 0;

                    for (var j = 0; j < tableHeaders.length; j++) {
                        if(tableHeaders[j] != ""){
                            var currentValue = data[i][tableHeaders[j].replace(/[_]/g, " ")].toString().replace(/["]/g, ""), nextMap = {};

                            if (count === 0) { // will take care of the first level and put into rootmap if it doesnt already exist in rootmap
                                currentMap = rootMap[currentValue];

                                if (!currentMap) {
                                    currentMap = {};
                                    rootMap[currentValue] = currentMap;
                                }

                                nextMap = currentMap;
                                count++;
                            } else {
                                nextMap = currentMap[currentValue];

                                if (!nextMap) {
                                    nextMap = {};
                                    currentMap[currentValue] = nextMap;
                                }

                                currentMap = nextMap;
                            }
                        }
                    }
                }

                makeTree(rootMap, list);

                allHash["name"] = "root";
                allHash["children"] = list;
                return allHash;
            }

            function makeTree(map, list) {
                var keyset = Object.keys(map),
                    childSet = [];

                for (var key in keyset) {
                    var childMap = map[keyset[key]],
                        dataMap = {};

                    dataMap["name"] = keyset[key];

                    if (_.isEmpty(childMap)) {
                        list.push(dataMap);
                    } else {
                        dataMap["children"] = childSet;
                        list.push(dataMap);

                        makeTree(childMap, childSet);
                        childSet = [];
                    }
                }
            }

            function update() {
                 /***************************************** Declare local callback functions ***************************/
                /** localCallbackApplyAllEdits
                 *  @desc: function that applies edit mode options whenever the barChart changes / redraws
                 */
                //TODO see if there is a better way to do this
                jvPackChart.localCallbackApplyAllEdits = function () {
                    scope.chartController.editMode.applyAllEdits();
                };

                jvPackChart.updateOptions = function(options){
                    scope.chartController.updateOptions(options);
                }

                jvPackChart.paintPackChart();
                scope.chartController.addJvChartToToolBar(jvPackChart);
            }

            function drawAxis() {
                axis = d3.select("#" + scope.chartController.chart).select("#axis");


                axis.append("div")
                    .attr("style", "position:absolute;top:0px;bottom:0px;left:0px;width:" + (labelPadding) + "px;")
                    .append(function () {
                        var compiledNode = $compile("<input ng-model='vizSearch' ng-change='vizSearchFunc(vizSearch, selectedAxis)' placeholder='Filter' style=\';height:100%;width:" + (labelPadding - 15) + "px\' >")(scope);
                        return compiledNode[0]
                    });


                for (var i = 0; i < globalEndTimeValues.length; i++) {
                    var axisHolder = axis.append("div")
                        .attr("style", "font-size:11px;position:absolute;top:0px;bottom:0px;left:" + (labelPadding + i * boxWidth) + "px;width:" + (boxWidth) + "px;")
                        .append(function () {
                            var compiledNode = $compile("<div class='center' style='width:100%'><text class='pointer' ng-click='vizSearchFunc(vizSearch,\"" + globalEndTimeValues[i] + "\")'>" + globalStartTimeValues[i] + "</text>" + "<i class='fa fa-times pointer' style='position:absolute;top:2px;margin-left:5px' ng-show=\'\"" + globalEndTimeValues[i] + "\"===selectedAxis\' ng-click='vizSearchFunc(vizSearch, false)\'></i>" + "</div>")(scope);
                            return compiledNode[0]
                        });

                }
            }

            function drawRects() {
                viz = d3.select("#" + scope.chartController.chartName).append("svg")
                    .attr("width", scope.chartController.container.width - rectPadding)
                    .attr("height", (gap + barHeight) * painted.length + axisHeight);

                var vizAxis = d3.svg.axis()
                    .scale(timeScale)
                    .orient('top')
                    .ticks(dateTicks, 1)
                    .tickSize(-((gap + barHeight) * painted.length - 4), 0, 0)
                    .tickFormat(d3.time.format(""));

                var grid = viz.append('g')
                    .attr('class', 'timeline-grid')
                    .attr('transform', 'translate(' + labelPadding + ', ' + axisHeight + ')')
                    .call(vizAxis);

                var rectGroup = viz.append("g")
                    .attr('transform', 'translate(' + 0 + ', ' + axisHeight + ')');
                var bigRects = rectGroup.append("g")
                    .selectAll("rect")
                    .data(painted)
                    .enter()
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", function (d, i) {
                        return i * (gap + barHeight) - 2;
                    })
                    .attr("width", function (d) {
                        return w - 0 - rectPadding;
                    })
                    .attr("height", (gap + barHeight))
                    .attr("stroke", "none")
                    .attr("fill", function (d) {
                        for (var i = 0; i < paintedTypes.length; i++) {
                            if (d['type'] == paintedTypes[i]) {
                                if (i % 2 == 0) {
                                    return "#d6d6d6"
                                }
                                else {
                                    return "#eeeeee"
                                }
                            }
                        }
                    })
                    .attr("opacity", .5);


                var rectangles = rectGroup.append('g')
                    .selectAll("rect")
                    .data(painted)
                    .enter();


                var innerStartRects = rectangles.append("rect")
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("x", function (d) {
                        return timeScale(dateFormat.parse(d.startTime)) + labelPadding;
                    })
                    .attr("y", function (d, i) {
                        return i * (gap + barHeight);
                    })
                    .attr("width", function (d) {
                        return (timeScale(dateFormat.parse(d.endTime)) - timeScale(dateFormat.parse(d.startTime)));
                    })
                    .attr("height", barHeight)
                    .attr("stroke", "none")
                    .attr("fill", colorScale)
                    .attr("id", function (d) {
                        return d['type'];
                    });

                var innerEndRects = rectangles.append("rect")
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("x", function (d) {
                        return timeScale(dateFormat.parse(d.endTime)) + labelPadding;
                    })
                    .attr("y", function (d, i) {
                        return i * (gap + barHeight);
                    })
                    .attr("width", function (d) {
                        return timeScale(dateFormat.parse(globalEndTime)) - (timeScale(dateFormat.parse(d.endTime)));
                    })
                    .attr("height", barHeight)
                    .attr("stroke", "none")
                    .attr("fill", "#CCCCCC");


                if (painted.length <= 0) {
                    viz.append("g")
                        .attr('transform', 'translate(' + (w - labelPadding - rectPadding) / 2 + ', ' + axisHeight + ')')
                        .append('text')
                        .attr("text-anchor", "middle")
                        .attr("font-size", "ll")
                        .text('No Results')
                }


                /*  var rectText = rectangles.append("text")
                 .text(function (d) {
                 return d.task;
                 })
                 .attr("x", function (d) {
                 return (timeScale(dateFormat.parse(d.endTime)) - timeScale(dateFormat.parse(d.startTime))) / 2 + timeScale(dateFormat.parse(d.startTime));
                 })
                 .attr("y", function (d, i) {
                 return i * (gap + barHeight) + 14;
                 })
                 .attr("font-size", 11)
                 .attr("text-anchor", "middle")
                 .attr("text-height", barHeight)
                 .attr("fill", "#000");*/

                var prevGap = axisHeight;
                var prevCount = 0;
                var numOccurances = [];

                for (var i in paintedTypesCount) {
                    numOccurances.push({type: i, count: paintedTypesCount[i], prevCount: prevCount});
                    prevCount += paintedTypesCount[i];
                }

                var axisText = viz.append("g")
                    .selectAll("text")
                    .data(numOccurances)
                    .enter()
                    .append('foreignObject')
                    .attr("x", 0)
                    .attr("y", function (d) {
                        return d['prevCount'] * (gap + barHeight);
                    })
                    .attr("height", function (d) {
                        return d['count'] * (gap + barHeight);
                    })
                    .attr("width", labelPadding)
                    .attr('transform', 'translate(' + 0 + ', ' + axisHeight + ')')
                    .append("xhtml:div")
                    .attr("height", function (d) {
                        return d['count'] * (gap + barHeight);
                    })
                    .attr("width", labelPadding - 15)
                    .append(function (d) {
                        var nodeUri = "http://semoss.org/ontologies/Concept/System/" + $filter('replaceSpaces')(d['type']);
                        var compiledNode = $compile("<div><text class='pointer' style='font-size:11px'" + "ng-dblclick='chartController.highlightSelectedItem([{name:" + "\"" + d['type'] + "\"" + ",uri:" + "\"" + nodeUri + "\"" + "}])\'" + "ng-click='vizHighlightType({name:" + "\"" + d['type'] + "\"" + ",uri:" + "\"" + nodeUri + "\"" + "})\'>" + d['type'] + "</text><i class='fa fa-times pull-right pointer' style='padding-top:1.5px; margin-right:1.5px' ng-show=\'\"" + d['type'] + "\"===selectedType.name\' ng-click='clearVizHighlightType(\"\", true)\'></i></div>")(scope);
                        return compiledNode[0]
                    })


                if (!_.isEmpty(scope.selectedType)) {
                    scope.vizHighlightType(scope.selectedType)
                }

            }


            scope.vizSearchFunc = function (search, year) {
                scope.selectedAxis = year;

                var localSearch = search.toUpperCase();

                if (_.isEmpty(localSearch) && _.isEmpty(year)) {
                    painted = JSON.parse(JSON.stringify(localChartData));
                    paintedTypes = JSON.parse(JSON.stringify(localChartDataTypes));
                    paintedTypesCount = JSON.parse(JSON.stringify(localChartDataTypesCount));
                } else {
                    painted = _.filter(localChartData, function (d) {
                        if (!_.isEmpty(localSearch) && !_.isEmpty(year)) {
                            return (d['task'].toUpperCase().indexOf(localSearch) > -1) && (d['endTime'] === year);
                        }

                        if (!_.isEmpty(localSearch) && _.isEmpty(year)) {
                            return d['task'].toUpperCase().indexOf(localSearch) > -1;

                        }
                        if (_.isEmpty(localSearch) && !_.isEmpty(year)) {
                            return d['endTime'] === year;

                        }
                    });

                    paintedTypes = _.groupBy(painted, 'type');
                    paintedTypesCount = {};
                    for (var i in paintedTypes) {
                        paintedTypesCount[i] = paintedTypes[i].length;
                    }
                    paintedTypes = _.keys(paintedTypes);
                }
                //clear out existing vizs
                d3.select("#" + scope.chartController.chart).select("#viz").selectAll("*").remove();

                //drawRects();
            };

            scope.vizHighlightType = function (selectedItem) {
                scope.selectedType = selectedItem;

                d3.select("#" + scope.chartController.chart).select("#viz").selectAll("rect").style({
                    "stroke-width": 0
                });
                d3.select("#" + scope.chartController.chart).select("#viz").select("rect[id='" + selectedItem.name + "']").style({
                    "stroke": "black",
                    "stroke-width": 1
                });


                vizHighlightProcessor();
            };


            scope.clearVizHighlightType = function (item) {
                scope.selectedType = item;

                d3.select("#" + scope.chartController.chart).select("#viz").selectAll("rect").style({
                    "stroke-width": 0
                });
                vizHighlightProcessor();
            };


            function vizHighlightProcessor() {
                var highlightTypePainted = false;
                for (var i in painted) {
                    if (painted[i]['type'] === scope.selectedType.name) {
                        highlightTypePainted = true;
                        break;
                    }
                }

                if (!highlightTypePainted) {
                    scope.selectedType = ""
                }

            }


            //when directive ends, make sure to clean out all $on watchers
            scope.$on("$destroy", function () {
            });
        }

        function jvPackCtrl($scope) {

        }
    }
})();
