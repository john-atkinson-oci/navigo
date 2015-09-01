/*global angular, $, _, window, document */
'use strict';
angular.module('voyager.details')
    .controller('DetailsCtrl', function ($scope, $stateParams, cartService, translateService, authService, config, detailService, mapServiceFactory, leafletData, usSpinnerService, dialogs, $sce, $q, configService, $timeout, tagService, searchService, $location, $window, urlUtil, resultsDecorator, loading, detailConfig, $analytics, $modal, filterService) {

        var displayParams = '';
        var _layer;

        loading.show('#working');
        $scope.imagePrefix = config.root + 'vres/mime/icon/';
        $scope.showTab = 'summary';

        $scope.demo = config.demo;
        $scope.rate = {};
        $scope.rate.current_rating = 0;
        $scope.rate.total_user = 0;
        $scope.rate.user_rated = false;
        $scope.labels = [];
        $scope.loading = true;
        $scope.disp = $stateParams.disp || 'default';
        $scope.hasRelationships = false;

        $scope.uiText = config.ui.details;

        $scope.showPath = detailConfig.showPath();
        $scope.showFormat = detailConfig.showFormat();

        var _tags = [];
        $scope.select2Options = {
            'multiple': true,
            'simple_tags': true,
            'tags': _tags
        };

        function _setPermissions() {
            $scope.canEdit = authService.hasPermission('edit_fields');
            $scope.canTag = authService.hasPermission('tag');
            $scope.canAdmin = authService.hasPermission('manage');
            $scope.canFlag = authService.hasPermission('flag');
        }

        function _activate() {
            _doLookup($stateParams.id);
            _setPermissions();

            tagService.fetchTags().then(function(tags) {
                $.merge(_tags,tags);
            });

            authService.addObserver(_setPermissions);
        }

        _activate();

        $scope.$watch('rate.user_rating', function(){
            if ($scope.rate.user_rating && !$scope.rate.user_rated) {
                $scope.rate.user_rated = true;
                $scope.rate.total_user += 1;
                $scope.rate.current_rating = Math.round(($scope.rate.current_rating + $scope.rate.user_rating) / ($scope.rate.total_user));
            }
        });

        function createFolderLinks(doc, url) {
            $scope.doc_path = {
                url: '#search?disp=' + $scope.disp + '&fq=location:' + doc.location,
                path: doc.fullpath.substring(0, doc.fullpath.indexOf(doc.folder.replace(/\//g, '\\')))
            };

            var tempFolders = doc.folder.split('/');
            _.each(tempFolders, function (item) {
                if (url !== '') {
                    url += '\/';
                }

                url += encodeURI(item);
                $scope.sub_paths.push({
                    path: item + '\\',
                    url: '#search?disp=' + $scope.disp + '&fq=path:' + url + '&fq=location:' + doc.location
                });
            });

            var filename = doc.fullpath.split('\\').pop();
            $scope.sub_paths.push({
                path: filename,
                url: '#search?disp=' + $scope.disp + '&fq=path:' + (url + '\/' + filename) + '&fq=location:' + doc.location
            });
        }

        function createDatasetLinks(doc) {
            var tempFolders = doc.fullpath.split('Dataset');

            if (tempFolders) {
                $scope.doc_path = {
                    url: '#search?disp=' + $scope.disp + '&fq=location:' + doc.location,
                    path: (tempFolders[0] + 'Dataset')
                };

                if (tempFolders[1]) {
                    var path = tempFolders[1].replace(/^[\/\\]/, '').replace(/\s[|]\s/g, '\\').replace(/\\/g, '%255C');
                    $scope.sub_paths.push({
                        path: tempFolders[1],
                        url: '#search?disp=' + $scope.disp + '&fq=location:' + doc.location + '&fq=path:' + path
                    });
                }
            }
        }

        function createPathLinks(doc) {
            $scope.isURL = doc.fullpath.indexOf('http:') === 0 || doc.fullpath.indexOf('https:') === 0;

            if (!$scope.isURL) {
                var url = '';
                $scope.sub_paths = [];

                if (doc.folder) {
                    createFolderLinks(doc, url);
                } else {
                    createDatasetLinks(doc);
                }
            }
        }

        function _doSyncFields(id) {
            detailService.lookup(id, ',*', $stateParams.shard, $stateParams.disp).then(function (data) {
                var doc = data.data.response.docs[0];
                //if (!_.isEqual(doc[key], value)) {
                //    attempts += 1;
                //    if(attempts < 5) {
                //        $timeout(function() {
                //            _doSyncFields(id, key, value, attempts);
                //        }, 1000);
                //    } else {
                //        console.log('failed to sync');
                //    }
                //} else {
                    $scope.displayFields = detailConfig.getFields(doc, detailService.getFields());
                    $scope.summaryFields = detailConfig.getSummaryFields(doc, detailService.getFields());
                //}
            });
        }

        function _doLookup(id) {
            detailService.lookup(id, ',*', $stateParams.shard, $stateParams.disp).then(function (data) {
                var doc = data.data.response.docs[0];
                $scope.doc = doc;
                $scope.image = doc.thumb;
                $scope.preview = doc.preview;
                if(angular.isUndefined(doc.preview)) {
                    $scope.preview = $scope.image;
                }

                $scope.download = doc.download;
                if(angular.isDefined(doc.format)) {
                    $scope.format = translateService.getType(doc.format);
                    $scope.doc.displayFormat = $scope.format;
                }

                $scope.displayFields = detailConfig.getFields(doc, detailService.getFields());
                $scope.summaryFields = detailConfig.getSummaryFields(doc, detailService.getFields());
                $scope.description = doc.displayDescription;

                if (doc.fullpath) {
                    createPathLinks(doc);
                } else {
                    $scope.isURL = false;
                }

                if (doc.bbox) {
                    $scope.hasBbox = true;
                    //$scope.$broadcast('updateBbox', {'bbox': $scope.doc.bbox});
                }

                doc.hasSchema = angular.isDefined(doc.schema);
                if(doc.hasSchema) {
                    $scope.schema = JSON.parse(doc.schema);
                    $scope.schemaLink = '#/search?disp=' + $scope.disp + '&fq=schema_hash:' + $scope.schema.hash;
                }

                $scope.doc.isMappable = mapServiceFactory.isMappable(doc.format);

                $scope.showMap = $scope.hasBbox || $scope.doc.isMappable;

                $scope.getAction = 'Download';
                if(angular.isDefined(doc.download)) {
                    doc.hasDownload = true;
                    if(doc.download.indexOf('file:') === 0) {
                        doc.canOpen = true;
                        $scope.getAction = 'Open';
                    }
                }

                if(angular.isDefined(doc.layerURL)) {
                    doc.isEsriLayer = true;
                }

                //TODO remove - doc.download should now have the stream url
                //if(doc.format_type === 'File' && doc.format_category === 'GIS' && doc.component_files && doc.component_files.length > 0) {
                //    doc.hasDownload = true;
                //}

                $scope.recent = detailService.getRecent();
                resultsDecorator.decorate($scope.recent, []);

                detailService.addRecent($scope.doc);

                if(doc.hasMetadata) {
                    _setStyle();
                }

                if(angular.isDefined(doc.tag_tags)) {
                    $scope.select2Options.tags = doc.tag_tags;
                    $scope.labels = doc.tag_tags;
                }

                $scope.getRelationships();
                _setSelectedTab();

                loading.done();
                $timeout(function() {
                    $scope.loading = false;
                    if($scope.doc.isMappable) {
                        $scope.addToMap();
                    }
                },100);
            });
        }

        function _setStyle() {
            $scope.theme = {};
            $scope.theme.selected = config.metadataStyle;
            $scope.$watch('theme.selected', function(){
                var shard = $stateParams.shard;
                var root = config.root;
                if (angular.isDefined(shard) && shard !== '[not a shard request]') {
                    root = shard.substring(0,shard.indexOf('solr'));
                    if (root.indexOf('http') === -1) {  //TODO what if its https? how to determine
                        root = 'http://' + root;
                    }
                }
                $scope.metadataUrl = root + 'content/' + $scope.doc.id + '/meta.xml?style=' + $scope.theme.selected;
            });
        }

        $scope.canCart = function () {
            return authService.hasPermission('process');
        };

        $scope.addToCart = function () {
            cartService.addItem($scope.doc);
        };

        $scope.removeFromCart = function () {
            cartService.remove($scope.doc.id);
        };

        $scope.inCart = function (id) {
            return cartService.isInCart(id);
        };

        $scope.showEditTag = false;
        $scope.toggleEditTag = function() {
            $scope.showEditTag = !$scope.showEditTag;
        };

        function _showError(error) {
            var message = null;
            if(angular.isDefined(error.details)) {
                message = error.details[0];
            }
            dialogs.error(error.message, message);
        }

        $scope.addToMap = function () {
            if($scope.addedToMap) {
                return false;
            }
            $timeout(function() {  //wait for scope to digest so map is ready
                leafletData.getMap('details-map').then(function(map) {
                    var mapInfo = _.clone($scope.doc);
                    var mapService = mapServiceFactory.getMapService(mapInfo);
                    mapService.addToMap(mapInfo, map).then(function(layer) {
                        if(layer.isValid !== false) {
                            layer.on('loading', function() {
                                //if(loaded === false) {
                                usSpinnerService.spin('map-spinner');
                                //}
                            });
                            usSpinnerService.stop('map-spinner');
                            layer.on('load', function() {
                                $scope.addedToMap = true;
                                _layer = layer;
                                usSpinnerService.stop('map-spinner');
                            });

                        } else {
                            usSpinnerService.stop('map-spinner');
                            _showError(layer.error);
                        }
                    }, function(error) {
                        usSpinnerService.stop('map-spinner');
                        _showError(error.error);
                    });
                    map.invalidateSize(false);  //workaround when initially hidden
                });

            });
        };

        $scope.removeFromMap = function() {
            leafletData.getMap('details-map').then(function(map) {
                map.removeLayer(_layer);
                $scope.addedToMap = false;
                _layer = null;
            });
        };

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.metadataSelect = function() {
            window.scrollTo(0,document.body.scrollHeight);
        };

        function _flagMissing(nodes) {
            var format, node;
            for(var i=0; i<nodes.length; i++) {
                node = nodes[i];
                format = node.mime;
                node.hasMissingData = angular.isDefined(format) && format.indexOf('missing') !== -1;
                if(node.children) {
                    _flagMissing(node.children);
                }
            }
        }

        $scope.getRelationships = function() {
            var root = $scope.doc.id;

            if(angular.isDefined($scope.doc.root)) {
                root = $scope.doc.root;
            }

            detailService.fetchTree(root,$stateParams.shard).then(function(response) {
                if(angular.isDefined(response.tree)) {
                    var tree = JSON.parse(response.tree);
                    if(tree.children) {
                        _flagMissing(tree.children);
                    }
                    $scope.tree = [
                        {
                            //label: tree.name,
                            mime: response.format,
                            name: tree.name,
                            id: tree.id,
                            children: tree.children
                        }
                    ];

                    $scope.hasRelationships = true;
                    _setSelectedTab();
                }
            });

            detailService.fetchToRelationships($scope.doc.id, displayParams, $stateParams.shard).then(function(relationships) {
                if (!$.isEmptyObject(relationships)) {
                    _.each(relationships, function(obj) {
                        if (obj.values && obj.values.length > 0) {
                            $scope.relationships = relationships;
                            $scope.hasRelationships = true;
                            _setSelectedTab();
                            return false;
                        }
                    });
                } else {
                    console.log('no result');
                }
            });

            detailService.fetchFromRelationships($scope.doc, displayParams, $stateParams.shard).then(function(relationships) {
                if (!$.isEmptyObject(relationships)) {
                    $scope.fromRelationships = relationships;
                    $scope.hasRelationships = true;
                    _setSelectedTab();
                } else {
                    console.log('no result');
                }
            });
        };

        function _setSelectedTab() {
            if (!$scope.displayFields.length) {
                if ($scope.doc.hasMetadata) {
                    $scope.showTab = 'metadata';
                } else if ($scope.hasRelationships) {
                    $scope.showTab = 'relationship';
                }
            }
        }

        $scope.fetchPreview = function(node) {
            $scope.previewVisible = true;
            node.promise = $timeout(function() {
                detailService.fetchTreePreview(node.id, $stateParams.shard).then(function(preview) {
                    $scope.previewNodeData = preview.data.response.docs[0];
                });
            }, 150);
        };

        $scope.cancelPreview = function(node) {
            $scope.previewVisible = false;
            $timeout.cancel(node.promise);
        };

        $scope.changeTab = function(tab) {
            if ($scope.showTab !== tab) {
                $scope.showTab = tab;

                if (tab === 'relationship' && $scope.tree === undefined) {
                    $scope.getRelationships();
                }
            }
        };

        $scope.edit = function(field) {
            field.editing = true;
            field.originalValue = field.value;
            field.originalFormatted = field.formattedValue;
        };

        $scope.append = function(field) {
            field.appending = true;
        };

        $scope.cancel = function(field) {
            field.editing = false;
            field.appending = false;
            field.value = field.originalValue;
            field.formattedValue = field.originalFormatted;
        };

        $scope.isArray = function(data) {
            return _.isArray(data);
        };

        function _mergeValues(field) {
            var value = [];
            if (angular.isDefined(field.value)) {
                value.push(field.value);
                if (field.value.indexOf(',') !== -1) {
                    value = field.value.split(',');
                    $.each(value, function(index, val) {
                        value[index] = val.trim();
                    });
                }
            }
            value.push(field.appendValue);
            return value;
        }

        $scope.doAppend = function(field) {
            if(!_.isEmpty(field.appendValue)) {
                var value = field.appendValue;
                if(field.key.indexOf('tag_') !== -1) {  //tag fields seem to behave different, append just overwrites so merge current value with new
                    value = _mergeValues(field);
                }
                tagService.save($scope.doc.id, field.key, value).then(function (response) {
                    field.appending = false;
                    var updatedValue = response.data[field.key];
                    if(_.isArray(updatedValue)) {
                        updatedValue = updatedValue.join();
                    }
                    field.formattedValue = updatedValue;
                    if(field.key.indexOf('tag_') !== -1) {
                        value = updatedValue;
                    }
                    field.appendValue = '';
                });
            } else {
                field.appending = false;
            }
        };

        $scope.doSave = function(field) {
            if(field.isArray && !_.isArray(field.value)) {
                var values = field.value.split(','), edits = [];
                _.each(values, function(val) {
                    edits.push(val.trim());
                });
                field.value = edits;
            }
            tagService.replace($scope.doc.id, field.key, field.value).then(function () {
                field.editing = false;

                // TODO solr call no longer returns this???
                // var updatedValue = response.data[field.key];
//                if(_.isArray(updatedValue)) {
//                    updatedValue = updatedValue.join();
//                }
//                field.formattedValue = updatedValue;
//                field.value = updatedValue;
//                field.isArray = _.isArray(updatedValue);

                // workaround since update no longer returns updated doc
                $timeout(function() {
                    _doSyncFields($scope.doc.id);
                }, 200);
            });
        };

        function _getId() {
            var temp = $location.path().split('/');
            return decodeURIComponent(temp[temp.length-1]);
        }

        function _move(direction, id) {
            var flag = 'no' + direction;
            if(id !== null) {
                $scope[flag] = false;
                var encodedId = encodeURIComponent(encodeURIComponent(id.id));  // TODO it doesn't work with just 1 encode
                var detailsUrl = '#/show/' + encodedId + '?disp=' + configService.getConfigId();
                if (angular.isDefined(id.shard) && id.shard !== '[not a shard request]') {
                    detailsUrl += '&shard=' + id.shard;
                }
                $window.location.href = detailsUrl;
                return true;
            } else {
                $scope[flag] = true;
                return false;
            }
        }

        $scope.lastSearch = urlUtil.getLastUrl();
        $scope.hasRecords = searchService.hasRecords();

        $scope.getPrevious = function() {
            var id = searchService.getPreviousId(_getId());
            if (_move('Previous', id)) {
                $scope.noNext = false;
            }
        };

        $scope.getNext = function() {
            usSpinnerService.spin('nav-spinner');
            searchService.getNextId(_getId()).then(function(id) {
                if (_move('Next', id)) {
                    $scope.noPrevious = false;
                }
                usSpinnerService.stop('nav-spinner');
            });
        };

        $scope.doDownload = function() {
            var doc = $scope.doc;
            $analytics.eventTrack('download', {
                category: 'results', label: doc.format // jshint ignore:line
            });
            //TODO not sure if we need category of GIS but we don't want to do this with general images
            //TODO remove - doc.download should now have the stream url
            //if(doc.format_category === 'GIS' && doc.component_files && doc.component_files.length > 0) { // jshint ignore:line
            //    var url = config.root + 'stream/' + doc.id + '.zip';
            //    $window.location.href = url;
            //} else {
            $window.location.href = doc.download;
            //}
        };

        $scope.doOpen = function() {
            var action = _.find(config.docActions,{action:'open'});
            $window.open(action.url + '?url=' + encodeURIComponent($scope.doc.fullpath));
        };

        $scope.showFlagModal = function() {
            var modal = $modal.open({
                templateUrl: 'src/bulk-updater/flag-all.html',
                controller: 'BulkUpdaterCtrl',
                resolve: {
                    resultData: function () {
                        return {
                            totalItemCount: 1,
                            docId: $scope.doc.id
                        };
                    }
                }
            });

            modal.result.then(function() {
                _doLookup($stateParams.id);
            });
        };

        $scope.searchFlag = function(tag) {
            $location.path('search');
            $location.search('fq', 'tag_flags:'+tag);
            filterService.setFilters({'fq' : 'tag_flags:'+tag});
            $scope.$emit('filterEvent');
            //$scope.$emit('searchEvent');

            return false;
        };

        $scope.searchTag = function(tag) {
            $location.path('search');
            $location.search('fq', 'tag_tags:'+tag);
            filterService.setFilters({'fq' : 'tag_tags:'+tag});
            $scope.$emit('filterEvent');
            //$scope.$emit('searchEvent');

            return false;
        };

    });