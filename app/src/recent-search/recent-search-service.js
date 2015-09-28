/* global angular, _ */
angular.module('voyager.search')
    .factory('recentSearchService', function(localStorageService, $location, filterService, mapUtil, sugar) {
        'use strict';

        var RECENT_ITEM_NAME = 'recent-items';
        var observers = [];

        var _notify = function (itemMap) {
            observers.forEach(function (entry) {
                entry(itemMap);
            });
        };

        var _getItems = function () {
            var items = localStorageService.get(RECENT_ITEM_NAME);
            if (items) {
                return items;
            }
            return [];
        };

        var _formatQuery = function(item) {
            var query = [];
            for (var i in item) {
                if (i !== 'saved' && i.indexOf('$') === -1 && i.indexOf('display') === -1) {
                    query.push(i + '=' + item[i]);
                }
            }

            return query.join('&');
        };

        return {
            addItem: function (item) {
                //TODO clean code - ugly, redundant, variable naming, use lodash?
                var itemMap = _getItems(),
                    duplicate = false;

//                if (_.isEmpty(item.q)) {
//                    item.q = '*:*';
//                }

                if ((_.isEmpty(item.q)) && _.isEmpty(item.query) && _.isEmpty(item.place) && _.isEmpty(item.bbox)) {
                    return;
                }

                if (itemMap.length) {
                    var i = 0,
                        t = itemMap.length;

                    for (; i<t; i++) {
                        if (item.q === undefined) {
                            if ((angular.isDefined(item.place) && itemMap[i].place === item.place) || (angular.isDefined(item.bbox) && (itemMap[i].bbox === item.bbox))) {
                                duplicate = true;
                                itemMap[i] = item;
                                break;
                            }
                        } else if (item.q === itemMap[i].q) {
                            if ((angular.isDefined(item.place) && itemMap[i].place === item.place) || (angular.isDefined(item.bbox) && (itemMap[i].bbox === item.bbox))) {
                                duplicate = true;
                                itemMap[i] = item;
                                break;
                            } else if (!angular.isDefined(item.place) && !angular.isDefined(item.bbox)) {
                                duplicate = true;
                                itemMap[i] = item;
                                break;
                            }
                        } else if (itemMap[i].query && (itemMap[i].query.indexOf(item.q) !== -1 || itemMap[i].query.indexOf(encodeURIComponent(item.q)) !== -1)) {
                            if(item.q && item.q.indexOf('!func') !== -1) {
                                duplicate = true;  // skip adding dup !func query
                                break;
                            }
                        }
                    }
                }

                if (!duplicate) {
                    if (itemMap.length > 5) {
                        itemMap.pop();
                    }
                    itemMap.splice(0, 0, item);
                }

                localStorageService.add(RECENT_ITEM_NAME, itemMap);
                _notify(itemMap);
            },
            getItems: function () {
                return _getItems();
            },
            deleteSearch: function (inx) {
                var itemMap = _getItems();
                itemMap.splice(inx, 1);
                localStorageService.add(RECENT_ITEM_NAME, itemMap);
                _notify(itemMap);
            },
            addObserver: function (observer) {
                observers.push(observer);
            },
            changeSaveStatus: function(id) {
                var itemMap = _getItems();

                for (var i=0, t=itemMap.length; i<t; i++) {
                    if (itemMap[i].id === id) {
                        itemMap[i].saved = itemMap[i].saved ? false : true;
                        break;
                    }
                }

                localStorageService.add(RECENT_ITEM_NAME, itemMap);
                _notify(itemMap);
            },
            updateSearchID: function(searchItem, data) {
                //TODO clean ugly code - variable naming, use lodash?, need inner loop?
                var itemMap = _getItems(),
                    isFound,
                    i = 0,
                    totalItemMapLength = itemMap.length;

                for (; i<totalItemMapLength; i++) {
                    isFound = true;
                    for (var attr in searchItem) {
                        if (attr.indexOf('$') === -1 && attr.indexOf('display') === -1 && attr !== 'fq' && searchItem[attr] !== itemMap[i][attr]) {
                            isFound = false;
                            continue;
                        }
                    }

                    if (isFound) {
                        break;
                    }
                }

                if (isFound) {
                    itemMap[i].id = data.id;
                    itemMap[i].title = data.title;
                    itemMap[i].saved = true;
                    localStorageService.add(RECENT_ITEM_NAME, itemMap);
                    _notify(itemMap);
                }
            },
            syncWithSavedSearches: function(savedSearches) {
                //TODO clean code - variable naming, use lodash?, need inner loop?
                var itemMap = _getItems(),
                    i = 0,
                    savedSearchInx,
                    totalItemMapLength = itemMap.length,
                    savedSearchLength = savedSearches.length,
                    found;

                for (; i<totalItemMapLength; i++) {
                    found = false;
                    savedSearchInx = 0;
                    for (; savedSearchInx<savedSearchLength; savedSearchInx++) {
                        if (itemMap[i].id === savedSearches[savedSearchInx].id) {
                            found = true;
                            break;
                        }
                    }
                    itemMap[i].saved = (found) ? true : false;
                }
                localStorageService.add(RECENT_ITEM_NAME, itemMap);
            },
            getItemsWithFormatBBox: function() {
                var itemMap = _getItems(),
                    i = 0,
                    totalItemMapLength = itemMap.length;

                for (; i<totalItemMapLength; i++) {
                    if (mapUtil.isBbox(itemMap[i].place)) {
                        itemMap[i].displayBBox = sugar.formatBBox(itemMap[i].place);
                    } else if (!_.isEmpty(itemMap[i].place)) {
                        itemMap[i].displayBBox = mapUtil.formatWktForDisplay(itemMap[i].place);
                    }
                    itemMap[i].displayPlaceOP = itemMap[i]['place.op'];
                }

                return itemMap;
            },
            applyRecentSearch: function(item, $scope) {
                var query = '';

                if (_.isEmpty(item.query)) {
                    query = _formatQuery(item);
                } else {
                    query = item.query;  //should be a solr query
                }

                $scope.$emit('clearSearchEvent');
                $location.path('search').search(query).search('recent', 'true');
                filterService.applyFromUrl($location.search()).then(function() {
                    $scope.$emit('addBboxEvent', {});  //updates map with bbox from url
                    $scope.$emit('filterEvent', {});
                });
            }
        };

    });