/*global angular */
angular.module('voyager.results')
    .controller('ResultErrorCtrl', function ($scope, $modalInstance, resultStackTrace) {
        'use strict';

        $scope.resultStackTrace  = JSON.stringify(resultStackTrace); // Indented 4 spaces
        //$scope.resultStackTrace = JSON.stringify(resultStackTrace, null, "\t"); // Indented with tab

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });