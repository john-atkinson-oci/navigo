/*global angular, $, window */
angular.module('voyager.results')
    .controller('TableCtrl', function ($scope, ngTableParams, $timeout, $location, configService, translateService, $filter, filterService, config, sugar, tableResultsService) {
        'use strict';

        var loaded = false;
        var reloading = false;
        var deferred;
        var lastSort = {};

        var addAction = _.find(config.docActions, {action:'add'});
        $scope.addActionText = 'Add to Queue';
        if(addAction) {
            $scope.addActionText = addAction.text;
        }

        function _setDefaultColumnWidths() {
            var defaultWidth = 88 / $scope.tableFields.length, width = 0, totalWidth = 0;

            $.each($scope.tableFields, function(index, field) {
                if(angular.isUndefined(field.width)) {
                    field.width = '' + defaultWidth + '%';
                } else if (field.width.indexOf('%') === -1) {
                    field.width = field.width + '%';
                }
                width = field.width.replace('%','');
                width = Number(parseFloat(width).toFixed(2));
                totalWidth += width;
            });
        }

        var Store = (function () {
            return {
                set: function (field, value) {
                    var fieldName = field.split('-')[1];
                    configService.updateColumnWidth(fieldName, value);
                },
                get: function (field) {
                    var fieldName = field.split('-')[1];
                    return configService.getColumnWidth(fieldName);
                }
            };
        }());

        window.store = Store;  //for resizable cols directive - storing changes to col width

        $scope.tableFields = configService.getTableFields();
        $scope.textWrappingNotAllowed = !configService.getAllowsTextWrappingOnTableView();

        _setDefaultColumnWidths();

        function _getSort(sortParam) {
            var name;
            for (name in sortParam) {
                if (sortParam.hasOwnProperty(name)) {
                    return {'sort':name,'direction': sortParam[name]};
                }
            }
        }

        $scope.hideThumbnails = !configService.getShowThumbnailOnTableView();
        $scope.hideFlags = !configService.getShowFlagOnTableView();

        $scope.toggleThumbnails = function() {
            $scope.hideThumbnails = !$scope.hideThumbnails;
        };

        $scope.applyFlag = function(flag) {
            filterService.clear();
            var params = $location.search();  // clone this?
            delete params.q;
            delete params.place;
            delete params.recent;
            params.fq = 'tag_flags' + flag;
            $location.search(params);

            // TODO will this fire multiple queries
            //$scope.$emit('removeFilterEvent', {});  //fire filter event

            filterService.setFilters({'fq' : 'tag_flags:'+flag});

            // TODO check if this is firing too many solr calls
            $scope.$emit('filterEvent');  //this should fire a search in the searchController, don't need search event
            //$scope.$emit('searchEvent');
            return false;
        };

        $scope.$on('searchResults', function (event, data) {
            $scope.tableFields = configService.getTableFields();
            _setDefaultColumnWidths();
            var docs = data.response.docs;
            if(!loaded) {
                loaded = true;
                deferred.resolve(docs);
            } else {  //reload
                reloading = true;
                $scope.tableParams.reload();
                deferred.resolve(docs); //for some reason this doesn't always reload the grid hence reload above
                reloading = false;
            }

            // keep the image and tools columns fixed - after scope digest
            $timeout(function() {
                tableResultsService.setFixedWidths();
            });

            $timeout(function () {
                $(window).trigger('resize');
            }, 200);
        });

        $scope.$on('changeView', function () {
            var view = $location.search().view;
            if (view === 'table') {
                $scope.$emit('doSearch', {});
            }
        });

        $scope.$on('$destroy', function() {
            configService.resetColumns();  //reset any column widths not saved
        });

        var tableParams = {
            count: 10,
            filter: {},
            sorting: {}
        };

        $scope.tableParams = new ngTableParams(tableParams, // jshint ignore:line
            {
            counts: [],
            total: 0, // length of data
            getData: function ($defer, params) {

                deferred = $defer;

                var isSort = !angular.equals(lastSort, params.sorting());

                if(isSort && (!loaded || reloading)) { //loading/reloading, don't sort
                    return;
                }

                if(isSort) {  //fire search to server side sort
                    lastSort = params.sorting();
                    var sort = _getSort(params.sorting());
                    $location.search('sort', sort.sort);
                    $location.search('sortdir', sort.direction);
                    $scope.$emit('doSearch', sort);
                } else if (!loaded) {
                    $scope.$emit('doSearch', {force:true});
                }

                if(!isSort) {  //set sort icon and highlight on column header that is sorted
                    var sortField = $location.search().sort;
                    var sortDir = $location.search().sortdir;
                    if(angular.isDefined(sortField)) {
                        var sortParam = {};
                        sortParam[sortField] = sortDir;
                        params.sorting(sortParam);
                    }
                }
            }
        });

        // TODO create a formatter service
        $scope.formatField = function(doc, facet) {
            var formatted = '', value = doc[facet.field];
            if(angular.isDefined(value)) {
                if (facet.field === 'format') {
                    formatted = translateService.getTypeAbbr(value);
                } else if (facet.field === 'modified') {
                    formatted = $filter('date')(Date.parse(value), 'M/d/yyyy, hh:mma');
                } else if (facet.field === 'bytes') {
                    if (value > 0) {
                        formatted = $filter('bytes')(value);
                    } else {
                        formatted = '0 bytes';
                    }
                } else if (sugar.isDate(value)) {
                    formatted = $filter('date')(Date.parse(value), 'M/d/yyyy, hh:mma');
                } else {
                    formatted = value;
                }
            }
            return formatted;
        };

        $scope.hover = function(doc) {
            $scope.$emit('resultHoverEvent', {
                doc: doc
            });
        };

        $scope.setDefer = function(defer) {
            deferred = defer;
        };

    });
