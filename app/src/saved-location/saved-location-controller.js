/*global angular, $, _ */
'use strict';

angular.module('voyager.search')
.controller('SavedLocationCtrl', function ($scope, $location, savedLocationService, $modal, authService) {

	function _loadSavedLocations() {
		savedLocationService.getSavedLocations().then(function(savedLocations) {
			var global = [], personal = [], permissions, all = '_EVERYONE';
			$.each(savedLocations, function(index, saved) {
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
			$scope.savedLocations = global;
			$scope.personalSavedLocations = personal;
		});
	}

	_loadSavedLocations();

	authService.addObserver(_loadSavedLocations);
	savedLocationService.addObserver(_loadSavedLocations);

	$scope.applySavedLocation = function(saved) {
		savedLocationService.applySavedLocation(saved, $scope);
	};

	$scope.deleteLocation = function(id) {
		savedLocationService.deleteLocation(id).then(function(){
			_loadSavedLocations();
		});
	};

	$scope.search = function() {
		if (_.isEmpty($scope.savedTerm)) {
			_loadSavedLocations();
			return;
		}

		savedLocationService.searchByTerm($scope.savedTerm).then(function(savedLocations){
			var personal = [], permissions, all = '_EVERYONE';
			$.each(savedLocations, function(index, saved) {
				permissions = _.indexBy(saved.share);
				if(!angular.isDefined(permissions[all])) {
					personal.push(saved);
				}
			});
			$scope.personalSavedLocations = personal;
		});
	};


	$scope.dragLocationControlListeners = {
		enabled: true,
		accept: function() {
			return $scope.dragLocationControlListeners.enabled;
		},
		orderChanged: function(eventObj) {
			var list = $scope.personalSavedLocations,
				index = eventObj.dest.index,
				beforeId = null,
				afterId = null;

			if (index !== 0) {
				beforeId = list[index-1].id;
			}
			if ((index + 1) !== list.length) {
				afterId = list[index+1].id;
			}

			$scope.dragLocationControlListeners.enabled = false;

			savedLocationService.order(list[index].id, beforeId, afterId).then(function(){
				$scope.dragLocationControlListeners.enabled = true;
			});
		}
	};
});