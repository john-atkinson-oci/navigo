/*global angular */
'use strict';
angular.module('voyager.search')
.controller('SavedSearchModalCtrl', function($scope, $modalInstance, tab, authService) {

	$scope.showTab = tab || 'saved';
	$scope.changeTab = function(tab) {
		if ($scope.showTab !== tab) {
			$scope.showTab = tab;
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

    //fired when selecting a saved search
	$scope.$on('filterChanged', function(){
		$scope.cancel();
	});

    $scope.isAnonymous = authService.isAnonymous();

    if($scope.isAnonymous) {
        $scope.showTab = 'suggested';
    }

    function _syncState() {
        $scope.isAnonymous = authService.isAnonymous();
    }

    authService.addObserver(_syncState);

});