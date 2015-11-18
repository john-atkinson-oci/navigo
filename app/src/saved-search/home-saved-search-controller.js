//TODO duplication with SavedSearchCtrl - add base class
'use strict';

angular.module('voyager.search')
.controller('HomeSavedSearchCtrl', function ($scope, $location, filterService, savedSearchService, authService, $analytics, recentSearchService) {

    $scope.hasPermission = function(permission) {
        return authService.hasPermission(permission);
    };

	function _loadSavedSearches() {
		savedSearchService.getSavedSearches().then(function(savedSearches) {
			var global = [], personal = [], permissions, all = '_EVERYONE';
			$.each(savedSearches, function(index, saved) {
				permissions = _.indexBy(saved.share);
				if(angular.isDefined(permissions[all])) {
					if (global.length < 6) {
						global.push(saved);
					}
				} else if (personal.length < 6) {
					personal.push(saved);
				}

				if (global.length === 6 && personal.length === 6) {
					return false;
				}
			});
			$scope.savedSearches = global;
			$scope.personalSavedSearches = personal;
		});
	}

	_loadSavedSearches();

	authService.addObserver(_loadSavedSearches);
	savedSearchService.addObserver(_loadSavedSearches);
	recentSearchService.addObserver(_loadSavedSearches);

	$scope.applySavedSearch = function(saved) {
		savedSearchService.applySavedSearch(saved, $scope);
	};

	$scope.deleteSearch = function(id) {
		savedSearchService.deleteSearch(id).then(function(){
			_loadSavedSearches();
			$analytics.eventTrack('saved-search', {
				category: 'delete'
			});
		});
	};

});