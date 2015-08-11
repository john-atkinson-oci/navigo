/*global angular, $, _, alert */

angular.module('fileBrowser')
    .controller('FileBrowserCtrl', function ($scope, fileBrowserService, usSpinnerService, $timeout, translateService, config, $stateParams) {
        'use strict';

        var pathSep = '\\';

        if(angular.isUndefined($scope.browserType)) {
            $scope.browserType = 'folder'; //default to folder browser
        }

        $scope.isInline = $stateParams.inline;

        if(angular.isUndefined($scope.path)) {
            $scope.path = '';
        }

        var pathClicked = false;

        function _decorate(list) {
            $.each(list, function( index, value ) {
                value.isFile = false;
                value.iconUrl = config.root + "vres/mime/icon/application/vnd.voyager.folder";
                if (angular.isUndefined(value.parentUri)) {
                    value.icon = "fa fa-hdd-o";
                    value.type = "Drive";
                } else if (value.folder === true) {
                    value.icon = "fa fa-folder gridFolder";
                    value.type = "Folder";
                } else {
                    //value.icon = "fa fa-file-o";
                    value.type = translateService.getType(value.format);
                    value.iconUrl = config.root + 'vres/mime/icon/' + value.format;
                    value.isFile = true;
                }

                if (angular.isDefined(value.parts) && value.parts.length > 0) {
                    value.hasParts = true;
                    value.partsCount = value.parts.length;
                    value.partsDisplay = value.parts.join('<br/>');
                }
            });
            return list;
        }

        function _getPathArray(response) {
            var pathLinks = [];
            if (response.data.uri.indexOf('\\') > -1) {  //windows
                pathLinks = response.data.uri.split('\\');
                if (pathLinks[1] === "") {
                    pathLinks = pathLinks.splice(0,1);
                }
            } else if (response.data.uri.indexOf('/') > -1) {  //mac
                pathLinks = response.data.uri.split('/');
                if (pathLinks[1] === "") {
                    pathLinks = pathLinks.splice(0,1);
                }
                pathSep = '/';
            }
            return pathLinks;
        }

        function _browse(path, selected) {
            var encoded = encodeURIComponent(path);
            usSpinnerService.spin('browser-spinner');
            fileBrowserService.browse(encoded).then(function(response) {

                $scope.gridData = _decorate(response.data.children);
                $scope.pathLinks = _getPathArray(response);
                $scope.editPath = false;
                $scope.path = path;
                $('#voyagerSearch').trigger('selectedPath', path);
                usSpinnerService.stop('browser-spinner');

            }, function(error) {
                usSpinnerService.stop('browser-spinner');
                $scope.error = "Could not open " + decodeURIComponent(path);
                //alert($scope.error);
                if(path !== '' && !selected) {
                    //try to browse to root
                    _browse('');
                }
            });
        }

        function _selectRow(rowItem, event) {
            if(rowItem.selected && rowItem.entity.folder === true) {
                _browse(rowItem.entity.uri, true);
            }
            if($scope.browserType !== 'folder') {
                $scope.path = rowItem.entity.uri;
                $('#voyagerSearch').trigger('selectedPath', $scope.path);
            }
        }

        var componentsTemplate = '<div class="ngCellText"> <a tooltip-html-unsafe="{{row.getProperty(\'partsDisplay\')}}" tooltip-append-to-body="true" tooltip-placement="left" class="badge" ng-show="{{row.getProperty(\'hasParts\')}}">{{row.getProperty(\'partsCount\')}}</a> {{row.getProperty(col.field)}}</div>';
        var nameTemplate = '<div class="ngCellText"><img src="{{row.getProperty(\'iconUrl\')}}"/> {{row.getProperty(col.field)}}</div>';

        $scope.gridOptions = {
            enableHighlighting: true,
            multiSelect: false,
            data: 'gridData',
            enableColumnResize: true,
            afterSelectionChange: _selectRow,
            columnDefs: [{field: 'name', displayName: 'Name', cellTemplate: nameTemplate}, {field:'type', displayName:'Type'}, {field: 'fileSize', displayName:'File Size',cellTemplate: componentsTemplate}]
        };

        //hack so the ng-grid width is correct in a dialog
        $timeout(function () { $(window).resize(); }, 0);

        $scope.$on('ngGridEventData', function(){
//            $scope.gridOptions.selectRow(0, true);
        });

        _browse($scope.path);

        $scope.browse = function() {
            _browse($scope.path);
        };

        function _getUri (path, index) {
            var uri;
            if(path !== '') {
                $scope.pathLinks.splice(index + 1, $scope.pathLinks.length - (index + 1));

                if($scope.pathLinks.length > 1) {
                    uri = $scope.pathLinks.join(pathSep);
                } else {
                    uri = $scope.pathLinks[0] + pathSep;
                }
            } else {
                uri = '';
            }
            return uri;
        }

        $scope.pathClick = function(path, index) {
            pathClicked = true;
            $scope.editPath = false;

            $scope.path = _getUri(path, index);
            _browse($scope.path);
        };

        $scope.pathContainerClick = function(path) {
            if (!pathClicked) {
                $scope.editPath = true;
                $timeout(function(){
                    angular.element("#pathInput").focus();
                },0);
            }
            pathClicked = false;
        };

        $scope.movedAway = function() {
            $scope.editPath = false;
        };

        $scope.setPath = function() {
            $('#voyagerSearch').trigger('selectedPath', $scope.path);
            $scope.ok($scope.path); //if inside modal
        };

        $scope.closeBrowser = function () {
            $('#voyagerSearch').trigger('cancelBrowse');
            $scope.cancel(); //if inside modal
        };

    });