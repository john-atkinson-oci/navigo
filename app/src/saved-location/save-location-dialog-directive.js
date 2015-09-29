/*global angular */
'use strict';

angular.module('voyager.search')
    .directive('vsSaveLocationDialog', function(authService, $location, savedLocationService) {

        return {
            restrict: 'E',
            templateUrl: 'src/saved-location/save-location-dialog.html',
            link: function(scope) {
                scope.savedLocation = {};
                scope.error = false;

                var _shareGroups = [];
                var _coreRoles = [{id:'_EVERYONE',text:'EVERYONE'},{id:'_LOGGEDIN',text:'LOGGEDIN'},{id:'_ANONYMOUS',text:'ANONYMOUS'}];

                scope.sharedOptions = {
                    'multiple': true,
                    'simple_tags': true,
                    data: function() {
                        return {results:_shareGroups};
                    }
                };

                scope.hasError = function() {
                    return scope.error !== false;
                };

                function _loadGroups() {
                    if(scope.canAdmin) { // use system groups
                        $.merge(_shareGroups, _coreRoles);
                        authService.fetchGroups().then(function(groups) {
                            $.merge(_shareGroups, groups);
                        });
                    }
                }

                function _getPrivileges() {
                    authService.getPrivileges().then(function() {
                        scope.canAdmin = authService.hasPermission('manage');
                        _loadGroups();
                    });
                }

                function _activate() {
                    _getPrivileges();
                }

                _activate();

                scope.ok = function () {

                    if (_.isEmpty(scope.savedLocation.name)) {
                        return;
                    }

                    var params = {};

                    if (scope.selectedMapType === 'Place') {
                        if (!_.isEmpty(scope.search.location)) {
                            params.place = scope.search.location;
                            var placeId = $location.search()['place.id'];
                            if(angular.isDefined(placeId)) {
                                params['place.id'] = placeId;
                            }
                            params['place.op'] = scope.selectedDrawingType.toLowerCase();
                        }
                    } else if (scope.search.place !== undefined) {
                        params.place = scope.search.place;
                        params['place.op'] = scope.selectedDrawingType.toLowerCase();
                    }

                    savedLocationService.saveLocation(scope.savedLocation, params).then(function(response) {
                        if (!angular.isDefined(response.data.error)) {
                            scope.$dismiss();
                            scope.error = false;
                            // scope.$emit('saveLocationSuccess', response.data);
                        } else {
                            scope.error = response.data.error;
                        }
                    }, function() {
                        scope.error = 'please try again later';
                    });
                };

                scope.cancel = function () {
                    scope.$dismiss();
                };
            }
        };

    });
