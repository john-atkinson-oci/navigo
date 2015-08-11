/*global angular, $, _*/

var ModalBrowseCtrl = function ($scope, $modalInstance, type, path) {
    'use strict';

    $scope.browserType = type;
    $scope.path = path;

    $scope.ok = function (path) {
        $modalInstance.close(path);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

angular.module('taskRunner')
    .directive('vsParam', function ($compile, templateService, leafletData, paramService) {
        'use strict';

        function _isGeometry($scope) {
            return $scope.param.type && $scope.param.type === "Geometry";
        }

        function _isProjection($scope) {
            return $scope.param.type && $scope.param.type === "Projection";
        }

        function _setMapHeight(scope) {
            var mapId = "view-map";
            if (_isGeometry(scope)) {
                mapId = "clip-map";
            }
            var type = scope.param.type;
            if(scope.param.readOnly === true) {
                mapId = "read-only-map";
            }
            leafletData.getMap(mapId).then(function (map) {
                //var width = $('.map').width();

                var width = $(map.getContainer()).width();
                var height = width/3*2;
                $(map.getContainer()).css('height',height);
                map.invalidateSize(false);  //workaround when initially hidden
            });
        }

        function _link(scope, element, attrs) {
            var template = templateService.get(scope.param.type, scope.param.readOnly);
            //scope.param.label = scope.param.name;
            element.html(template).show();
            $compile(element.contents())(scope);
            if (scope.param.hasMap === true) {
                _setMapHeight(scope);
            }
        }

        function _controller($scope, $modal) {

            var lastTerm = '';
            var filteredGroups = [];

            if(_isProjection($scope)) {

                var defaultSelect = {id:0,text:'Same As Input'};
                if ($scope.param.selected) {
                    defaultSelect = $scope.param.selected;
                }
                $scope.select2Options = {
                    dropdownAutoWidth: 'true',
                    minimumResultsForSearch: 5,
                    minimumInputLength: 3,
                    initSelection : function (element, callback) {
                        callback(defaultSelect);
                    },
                    query: function (query) {
                        var groups;
                        if(query.term.length === 3) {  //clear, new search
                            groups = paramService.getProjections();
                        } else if (query.term.length > lastTerm.length) { //typing more, keep filtering down
                            groups = filteredGroups.slice();
                        } else {  //removing chars, clear
                            groups = paramService.getProjections();
                        }
                        filteredGroups = [];
                        lastTerm = query.term;
                        var data = {results: []}, name, term;
                        $.each(groups, function(key, group) {
                            var filteredGroup = {text:group.text, children:[]};
                            $.each(group.children, function(i, projection) {
                                name = projection.name.toLowerCase();
                                term = query.term.toLowerCase();
                                if(name.indexOf(term) !== -1) {
                                    projection.id = projection.value;
                                    projection.text = projection.name;
                                    filteredGroup.children.push(projection);
                                }
                            });
                            if(filteredGroup.children.length > 0) {
                                filteredGroups.push(filteredGroup);
                            }
                        });
                        data.results = filteredGroups;
                        query.callback(data);
                    }
                };
            }

            $scope.browserType = 'folder';
            $scope.open = function (size) {

                var modalInstance = $modal.open({
                    templateUrl: 'common/filebrowser/file-browser.html',
                    controller: 'ModalBrowseCtrl',
                    size: size,
                    resolve: {
                        type: function () {
                            return $scope.browserType;
                        },
                        path: function() {
                            return $scope.param.value;
                        }
                    }
                });

                modalInstance.result.then(function (path) {
                    $scope.param.value = path;
                });
            };
        }

        return {
            restrict: "E",
            replace: true,
            link: _link,
            controller: _controller,
            scope: {
                param: '=',
                show: '='
            }
        };
    });