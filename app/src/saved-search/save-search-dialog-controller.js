/*global angular */
'use strict';

angular.module('voyager.search')
    .controller('SaveSearchDialog', function($scope, $modalInstance, savedSearchService, $location, authService, $analytics, recentSearchService, searchItem) {

        $scope.savedSearch = {query:searchItem.query};

        var _shareGroups = [];
        var _coreRoles = [{id:'_EVERYONE',text:'EVERYONE'},{id:'_LOGGEDIN',text:'LOGGEDIN'},{id:'_ANONYMOUS',text:'ANONYMOUS'}];

        $scope.sharedOptions = {
            'multiple': true,
            'simple_tags': true,
            data: function() {
                return {results:_shareGroups};
            }
        };

        function _loadGroups() {
            if($scope.canAdmin) { // use system groups
                $.merge(_shareGroups, _coreRoles);
                authService.fetchGroups().then(function(groups) {
                    $.merge(_shareGroups, groups);
                });
            } else if ($scope.canShare) {  // use user's groups
                authService.getUserInfo().then(function(user) {
                    var groups = [];
                    _(user.groups).forEach(function(n) {groups.push({id:n,text:n});});
                    $.merge(_shareGroups, groups);
                });
            }
        }

        function _getPrivileges() {
            authService.getPrivileges().then(function() {
                $scope.canAdmin = authService.hasPermission('manage');
                $scope.canSave = authService.hasPermission('save_searches');
                $scope.canShare = authService.hasPermission('share_saved_search');

                _loadGroups();
            });
        }

        function _activate() {
            _getPrivileges();
        }

        _activate();

        $scope.ok = function () {

            if (_.isEmpty($scope.savedSearch.title)) {
                return;
            }

            savedSearchService.saveSearch($scope.savedSearch, searchItem).then(function(response) {

                $modalInstance.close();
                $analytics.eventTrack('saved-search', {
                    category: 'save'
                });

                recentSearchService.updateSearchID(searchItem, response.data);
                $scope.$emit('saveSearchSuccess', response.data);

            }, function(error) {
                console.log(error.data);
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.hasPermission = function(permission) {
            return authService.hasPermission(permission);
        };

    });
