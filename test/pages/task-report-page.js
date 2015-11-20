/**
 * Processing task report page object.
 */

var taskReportPage = (function () {
    'use strict';

    return {

        getTableGrid: function() {
            return $$('.col-xs-12');
        },

        getCancelButton: function() {
            return element(by.css('[ng-click="cancel()"]'));
        }

    }

})();  // jshint ignore:line
module.exports = taskReportPage;