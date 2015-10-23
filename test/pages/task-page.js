var taskPage = (function () {
    'use strict';

    var Util = require('../lib/util.js');

    return {
        getParams: function() {
            return element.all(by.repeater('p in params'));
        },
        executeTask: function() {
            // Execute the task
            Util.waitForSpinner();
            element(by.css('[ng-click="execTask()"]')).click();
            browser.sleep(15000); // Sleep required to avoid timeout
            browser.waitForAngular();
        },
        getParameterValues: function() {
            return element.all(by.css('.select2-choice')).all(by.css('.select2-chosen'));
        },
        getTaskButton: function() {
            return element(by.css('[ng-click="execTask()"]'));
        }
    };
})();  // jshint ignore:line
module.exports = taskPage;