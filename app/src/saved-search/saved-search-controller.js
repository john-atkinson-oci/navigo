/*global angular, $, _ */
'use strict';

angular.module('voyager.search')
.controller('SavedSearchCtrl', function ($scope, $location, filterService, savedSearchService, $modal, authService, $analytics, recentSearchService) {

	function _loadSavedSearches() {
		savedSearchService.getSavedSearches().then(function(savedSearches) {
			var global = [], personal = [], permissions, all = '_EVERYONE';
			$.each(savedSearches, function(index, saved) {
				permissions = _.indexBy(saved.share);
				if(angular.isDefined(permissions[all])) {
					global.push(saved);
				} else {
					personal.push(saved);
				}

				if (global.length === 6 && personal.length === 6) {
					return false;
				}
			});
			$scope.savedSearches = global;
			$scope.personalSavedSearches = personal;
		});

		$scope.isAnonymous = authService.isAnonymous();
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

	$scope.dragControlListeners = {
		enabled: true,
		accept: function() {
			return $scope.dragControlListeners.enabled;
		},
	    orderChanged: function(eventObj) {
			var list = $scope.personalSavedSearches,
				index = eventObj.dest.index,
				beforeId = null,
				afterId = null;

			if (index !== 0) {
				beforeId = list[index-1].id;
			}
			if ((index + 1) !== list.length) {
				afterId = list[index+1].id;
			}

			$scope.dragControlListeners.enabled = false;

			savedSearchService.order(list[index].id, beforeId, afterId).then(function(){
				$scope.dragControlListeners.enabled = true;
			});
	    }
	};
});