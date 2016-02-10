'use strict';
angular.module('cart').
    factory('cartItemsQuery', function (config, filterService, configService, sugar, $http, translateService, $log) {

        function _cleanFilters(filters) {
            var cleanFilters = _.clone(filters), pos;
            _.each(cleanFilters, function(filter, index) {
                pos = filter.indexOf('{!tag');
                if(pos !== -1) {
                    pos = filter.indexOf('}');
                    cleanFilters[index] = filter.substring(pos+1);
                }
            });
            return cleanFilters.join(' AND ');
        }

        //function _getPlaceFilter(queryCriteria, start) {
        //    var filters = '', sep = ' AND ';
        //    if(start) {
        //        sep = '';
        //    }
        //    if(angular.isDefined(queryCriteria.params.place)) {
        //        filters += sep + 'place:' + queryCriteria.params.place;
        //        if(angular.isDefined(queryCriteria.params['place.id'])) {
        //            filters += ' AND place.id:' + queryCriteria.params['place.id'];
        //        }
        //        if(angular.isDefined(queryCriteria.params['place.op'])) {
        //            filters += ' AND place.op:' + queryCriteria.params['place.op'];
        //        }
        //    }
        //    //delete - these are now part of the q param
        //    delete queryCriteria.params.place;
        //    delete queryCriteria.params['place.id'];
        //    delete queryCriteria.params['place.op'];
        //
        //    return filters;
        //}

        function _applyItems(queryCriteria, items) {
            var itemsStr = '', sep = '', hasItems = false, filters, bounds;
            if (items && items.length > 0) {
                itemsStr = 'id:(' + items.join(' ') + ')';
                sep = ' OR ';
                hasItems = true;
            }
            //TODO don't think we need this
            //if(queryCriteria.hasQuery !== false && angular.isUndefined(queryCriteria.params.q) && hasItems) {
            //    queryCriteria.params.q = '*';  //has items and query is defined but keyword empty, default to *
            //}
            if(angular.isDefined(queryCriteria.params.q) && _.isEmpty(queryCriteria.solrFilters)) { //no filters
                queryCriteria.params.q = itemsStr + sep + queryCriteria.params.q;
            } else if (hasItems && !_.isEmpty(queryCriteria.solrFilters) && angular.isDefined(queryCriteria.params.q)) { //has items and filters, do an OR
                filters = _cleanFilters(queryCriteria.solrFilters); //filters are AND (within OR below)
                if(angular.isDefined(queryCriteria.bounds) && !_.isEmpty(queryCriteria.bounds)) {
                    bounds = queryCriteria.bounds.replace('&fq=','');
                    filters += ' AND ' + bounds;
                }
                //TODO place isn't working as q param
                //filters += _getPlaceFilter(queryCriteria);

                if (_.has(queryCriteria, 'constraints')){
                    filters += queryCriteria.filters;
                    queryCriteria.params.q = itemsStr + sep + filters;
                }
                else {
                    queryCriteria.params.q = itemsStr + sep + '(' + filters + ')';
                }
                queryCriteria.params.q = itemsStr + sep + '(' + queryCriteria.params.q + ' AND ' + filters + ')';
            } else if (hasItems && !_.isEmpty(queryCriteria.solrFilters)) { //has items and filters, do an OR
                filters = _cleanFilters(queryCriteria.solrFilters); //filters are AND (within OR below)
                if(angular.isDefined(queryCriteria.bounds) && !_.isEmpty(queryCriteria.bounds)) {
                    bounds = queryCriteria.bounds.replace('&fq=','');
                    filters += ' AND ' + bounds;
                }
                //TODO place isn't working as q param
                //filters += _getPlaceFilter(queryCriteria);

                if (_.has(queryCriteria, 'constraints')){
                    filters += queryCriteria.filters;
                    queryCriteria.params.q = itemsStr + sep + filters;
                }
                else {
                    queryCriteria.params.q = itemsStr + sep + '(' + filters + ')';
                }

            } else if (hasItems && angular.isDefined(queryCriteria.bounds) && !_.isEmpty(queryCriteria.bounds)) { //has items and bounds, do an OR
                bounds = queryCriteria.bounds.replace('&fq=','');
                queryCriteria.params.q = itemsStr + sep + '(' + bounds + ')';
                //TODO place isn't working a q param
            //} else if (hasItems && angular.isDefined(queryCriteria.params.place)) { //has items and place, do an OR
            //    filters = _getPlaceFilter(queryCriteria, true);
            //    queryCriteria.params.q = itemsStr + sep + '(' + filters + ')';
            } else if( hasItems && !_.isEmpty(queryCriteria.filters)) {
                queryCriteria.params.q = itemsStr + queryCriteria.filters;
            } else {
                queryCriteria.params.q = itemsStr;
            }
        }

        function _setParams(queryCriteria, items) {
            var queryString = '';
            if(!queryCriteria) {
                queryCriteria = {params:{}, hasQuery:false};
            }
            if(!_.isEmpty(items)) {
                _applyItems(queryCriteria, items);
            }
            queryString += '?' + sugar.toQueryString(queryCriteria.params);
            return queryString;
        }

        function _addRow(results, add, item) {
            if(add) {
                results.push({'key':item, displayFormat:translateService.getType(item)});
            } else {
                results[results.length - 1].count = item;
            }
            return !add;
        }

        function _buildRows(items) {
            var isKey = true, results = [], count = 0;
            $.each(items, function (index, item) {
                isKey = _addRow(results, isKey, item);
                if(isKey) {
                    count += item;
                }
            });
            return {results:results, count:count};
        }

        function _getSummaryQueryString(queryCriteria, items) {
            var queryString = config.root + 'solr/v0/select';
            queryString += _setParams(queryCriteria, items);
            queryString += '&fl=id,name:[name],format&extent.bbox=true';
            queryString += '&facet=true&stats=true&stats.field=bytes&facet.field=format&facet.mincount=1&rows=0';
            if(queryCriteria && (angular.isUndefined(items) || items.length === 0)) { //setParams will apply filters
                if(angular.isDefined(queryCriteria.filters)) {
                    queryString += queryCriteria.filters;
                }
                queryString += queryCriteria.bounds;
            }
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            $log.log('Cart summary queryString: ' + queryString);
            return queryString;
        }

        function _getQueryString(queryCriteria, items) {
            var queryString = config.root + 'solr/v0/select';
            queryString += _setParams(queryCriteria, items);
            queryString += '&fl=id,title,name:[name],format,thumb:[thumbURL]';
            queryString += '&rows=100&extent.bbox=true';

            if(queryCriteria && (angular.isUndefined(items) || items.length === 0)) { //setParams will apply filters
                if(angular.isDefined(queryCriteria.filters)) {
                    queryString += queryCriteria.filters;
                }
                queryString += queryCriteria.bounds;
            }
            queryString += '&rand=' + Math.random(); // avoid browser caching?
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            $log.log('Cart queryString: ' + queryString);
            return queryString;
        }

        function _getQueuedQueryString(queryCriteria, items, queued) {
            var queryString = config.root + 'solr/v0/select';
            if(!queryCriteria) {
                queryCriteria = {params:{}, hasQuery:false};
            }
            if(queued && queued.length > 0) {
                var ids = _.pluck(queued, 'id');
                if (queryCriteria.params.fq) {
                    queryCriteria.params.fq.push('id:(' + ids.join(' ') + ')');
                } else {
                    queryCriteria.params.fq = 'id:(' + ids.join(' ') + ')';
                }
            }
            queryString += _setParams(queryCriteria, items);
            queryString += '&fl=id';
            queryString += '&rows=100&extent.bbox=true&block=false';
            if(queryCriteria && (angular.isUndefined(items) || items.length === 0)) { //setParams will apply filters
                if(angular.isDefined(queryCriteria.filters)) {
                    queryString += queryCriteria.filters;
                }
                if(angular.isDefined(queryCriteria.bounds)) {
                    queryString += queryCriteria.bounds;
                }
            }
            queryString += '&rand=' + Math.random(); // avoid browser caching?
            queryString += '&wt=json&json.wrf=JSON_CALLBACK';
            $log.log('Cart queued queryString: ' + queryString);
            return queryString;
        }

        function _getQueryCriteria(solrParams) {
            var params = _.clone(solrParams);
            var solrFilters = filterService.getSolrList();
            delete params.fq; //filter service will apply filter params below
            delete params.sort;
            delete params.view;
            delete params.vw;
            delete params.disp;
            if(params.q === '*:*') {
                delete params.q;
            }
            return {params:params, filters: filterService.getFilterParams(), bounds: filterService.getBoundsParams(), solrFilters: solrFilters};
        }

        function _decorate(items) {
            $.each(items, function(index, item) {
                if(angular.isDefined(item.format)) {
                    item.displayFormat = translateService.getType(item.format);
                } else {
                    item.displayFormat = 'Unknown';
                }
                if(angular.isDefined(item.thumb) && item.thumb.indexOf('vres/mime') !== -1) {
                    item.defaultThumb = true;
                }
            });
        }

        function _fetchItems(queryCriteria, items) {
            return $http.jsonp(_getQueryString(queryCriteria, items)).then(function(res) {
                var docs = res.data.response.docs;
                _decorate(docs);
                return {'docs': docs, 'bbox':res.data['extent.bbox'], count:res.data.response.numFound};
            });
        }

        function _fetchQueued(queryCriteria, items, queued) {
            return $http.jsonp(_getQueuedQueryString(queryCriteria, items, queued)).then(function(res) {
                return res.data.response.docs;
            });
        }

        function _fetchSummary(queryCriteria, items) {
            return $http.jsonp(_getSummaryQueryString(queryCriteria, items)).then(function(res) {
                var rows = _buildRows(res.data.facet_counts.facet_fields.format);
                return {'docs': rows.results, 'bbox':res.data['extent.bbox'], count:res.data.response.numFound};
            });
        }

        function _fetchItemsOnly(query) {
            return $http.jsonp(query).then(function(res) {
                return res.data.response.docs;
            });
        }

        return {

            getQueryCriteria: function (params) {
                return _getQueryCriteria(params);
            },

            execute: function (queryCriteria, items) {
                var count = 1;
                if (queryCriteria) {
                    count = queryCriteria.count;
                    delete queryCriteria.params.sort;
                }
                if(count <= 100) {
                    return _fetchItems(_.clone(queryCriteria), items);
                } else {
                    return _fetchSummary(_.clone(queryCriteria), items);
                }
            },

            fetchItems: function(queryCriteria, items) {
                return _fetchItems(queryCriteria, items);
            },

            fetchQueued: function(queryCriteria, items, queued) {
                return _fetchQueued(_.clone(queryCriteria), items, queued);
            },

            fetchItemsOnly: function(items) {
                var queryString = config.root + 'solr/v0/select';
                if(items) {
                    var ids = _.keys(items);
                    queryString += '?fq=id:(' + ids.join(' ') + ')';

                }
                queryString += '&fl=id';
                queryString += '&rows=100';
                queryString += '&rand=' + Math.random(); // avoid browser caching?
                queryString += '&wt=json&json.wrf=JSON_CALLBACK';
                return _fetchItemsOnly(queryString);
            }
        };
    });
