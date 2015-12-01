'use strict';

angular.module('voyager.search')
.controller('SavedLocationsCtrl', function ($scope, $location, savedLocationService, $modal, authService) {

	var vm = this;

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
			vm.savedLocations = global;
			vm.personalSavedLocations = personal;
		});
	}

	_loadSavedLocations();

	authService.addObserver(_loadSavedLocations);
	savedLocationService.addObserver(_loadSavedLocations);

	vm.applySavedLocation = function(saved) {
		savedLocationService.applySavedLocation(saved, $scope);
	};

	vm.deleteLocation = function(id) {
		savedLocationService.deleteLocation(id);  //observer will reload
	};

	vm.search = function() {
		if (_.isEmpty(vm.savedTerm)) {
			_loadSavedLocations();
			return;
		}

		savedLocationService.searchByTerm(vm.savedTerm).then(function(savedLocations){
			var personal = [], permissions, all = '_EVERYONE';
			$.each(savedLocations, function(index, saved) {
				permissions = _.indexBy(saved.share);
				if(!angular.isDefined(permissions[all])) {
					personal.push(saved);
				}
			});
			vm.personalSavedLocations = personal;
		});
	};


	vm.dragLocationControlListeners = {
		enabled: true,
		accept: function() {
			return vm.dragLocationControlListeners.enabled;
		},
		orderChanged: function(eventObj) {
			var list = vm.personalSavedLocations,
				index = eventObj.dest.index,
				beforeId = null,
				afterId = null;

			if (index !== 0) {
				beforeId = list[index-1].id;
			}
			if ((index + 1) !== list.length) {
				afterId = list[index+1].id;
			}

			vm.dragLocationControlListeners.enabled = false;

			savedLocationService.order(list[index].id, beforeId, afterId).then(function(){
				vm.dragLocationControlListeners.enabled = true;
			});
		}
	};
});