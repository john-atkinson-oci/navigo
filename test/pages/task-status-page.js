/**
 * Processing task status page object.
 */

var taskStatusPage = (function () {
    'use strict';

    return {

        verifyStatus: function() {
            /** Verify the task completed. */
            expect(browser.getCurrentUrl()).toMatch(/\/#\/status/);
        },

        verifyDownloadLink: function() {
            expect(element(by.css('.btn.btn-secondary.pull-right.ml15.ng-scope')).isPresent()).toBeTruthy();
        },

        verifySuccess: function() {
            expect(element(by.css('.alert-success')).isPresent()).toBeTruthy();
        },

        verifyErrors: function() {
            expect(element(by.css('.alert-error')).isPresent()).toBeTruthy();
        },

        verifyWarnings: function() {
            expect(element(by.css('.alert-warning')).isPresent()).toBeTruthy();
        }

    }

})();  // jshint ignore:line
module.exports = taskStatusPage;