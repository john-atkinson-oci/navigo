/*global angular */
'use strict';
angular.module('voyager.search').directive('savedContent', function(authService) {

	return {
		restrict: 'E',
		templateUrl: 'src/saved-content/saved-content-modal.html',
		link: function(scope) {

			scope.showSearch = true;
			scope.showTab = scope.tab || 'saved';

			scope.showCategory = function(category) {
				if (category === 'search') {
					if (!scope.showSearch) {
						scope.showSearch = true;
						scope.showTab = scope.isAnonymous ? 'suggested' : 'saved';
					}
				} else {
					scope.showSearch = false;
					scope.showTab = scope.isAnonymous ? 'suggested' : 'saved';
				}
			};

			scope.changeTab = function(tab) {
				if (scope.showTab !== tab) {
					scope.showTab = tab;
				}
			};

			scope.cancel = function() {
				scope.$dismiss();
			};

			//fired when selecting a saved search
			scope.$on('filterChanged', function(){
				scope.cancel();
			});

			scope.isAnonymous = authService.isAnonymous();

			if(scope.isAnonymous) {
				scope.showTab = 'suggested';
			}

			function _syncState() {
				scope.isAnonymous = authService.isAnonymous();
			}

			authService.addObserver(_syncState);
		}
	};

});