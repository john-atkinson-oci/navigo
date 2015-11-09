/**
 * Processing task status page object.
 */

var taskStatusPage = (function () {
    'use strict';

    return {

        getSuccess: function() {
            return element(by.css('.alert-success'));
        },

        getDownloadLink: function() {
            return element(by.css('.btn.btn-secondary.pull-right.ml15.ng-scope'));
        },

        getError: function() {
            return element(by.css('.alert-error'));
        },

        getWarning: function() {
            return element(by.css('.alert-warning'));
        }

    }

})();  // jshint ignore:line
module.exports = taskStatusPage;