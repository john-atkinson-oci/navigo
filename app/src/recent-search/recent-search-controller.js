/*global angular */
angular.module('voyager.search')
	.controller('RecentSearchCtrl', function ($scope, recentSearchService, savedSearchService, $timeout, authService) {
		'use strict';

		$scope.toggleSave = _toggleSaveStatus;
		$scope.deleteSearch = _deleteSearchByIndex;
		$scope.openSearchModal = _openSearchModal;
		$scope.applyRecentSearch = _applyRecentSearch;

        $scope.hasPermission = function(permission) {
            return authService.hasPermission(permission);
        };

		_init();

		function _init() {
		    savedSearchService.getSavedSearches().then(function(respond){
		        recentSearchService.syncWithSavedSearches(respond);
				_getRecentSearch();
		    });
			recentSearchService.addObserver(_getRecentSearch);
			savedSearchService.addObserver(_changeSearchStatus);
		}

		/**
		 * @function - get recent search
		 */
		function _getRecentSearch() {
			$timeout(function() {
				$scope.recentSearches = recentSearchService.getItemsWithFormatBBox();
			}, 10);
		}

		/**
		 * @function - toggle search saved status
		 */
		function _toggleSaveStatus(item) {
			if (!item.saved) {
				savedSearchService.showSaveSearchDialog(item);
			}
			else {
				savedSearchService.deleteSearch(item.id);
			}
		}

		function _changeSearchStatus(id) {
			recentSearchService.changeSaveStatus(id); //update recent search save status
			_getRecentSearch();
		}

		function _deleteSearchByIndex(id) {
			recentSearchService.deleteSearch(id);
		}

		function _openSearchModal() {
			savedSearchService.showSearchModal('recent');
		}

		function _applyRecentSearch(searchItem) {
			recentSearchService.applyRecentSearch(searchItem, $scope);
			if (typeof($scope.cancel) === 'function') {
				$scope.cancel();
			}
		}

	});