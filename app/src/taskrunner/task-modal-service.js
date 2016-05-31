/*global angular */

angular.module('taskRunner').
	factory('taskModalService', function ($uibModal) {
		'use strict';
		var modalInstance = null;

		return {

			showTaskValidationError: function(errorMessage, constraintFormats) {
				$uibModal.open({
					templateUrl: 'src/taskrunner/task-error-dialog.html',
					controller: 'TaskErrorCtrl',
					size: 'lg',
					resolve: {
						errorMessage: function() {
							return errorMessage;
						},
						constraintFormats: function() {
							return constraintFormats;
						}
					}
				});
			},

			showInvalidTaskItems: function(invalidTaskItems) {
				modalInstance = $uibModal.open({
					templateUrl: 'src/taskrunner/invalid-items-dialog.html',
					controller: 'InvalidItemsCtrl',
					size: 'lg',
					resolve: {
						invalidTaskItems: function() {
							return invalidTaskItems;
						}
					}
				});
				return modalInstance;
			},

			close: function() {
				modalInstance.close();
			}
		};

	});
