'use strict';


describe('Run Convert to KML Task', function() {

    var Util = require('../../lib/util.js');
    var searchPage = require('../../pages/search-page.js');
    var taskPage = require('../../pages/task-page.js');
    var server = Util.getServer();

    // Load and run Convert to KML task
    it('should run convert_to_kml using default parameter values', function() {
        searchPage.addAllToQueue('title:ca_ozone_pts');

        browser.get(server + '#/queue?disp=default&task=convert_to_kml');
        Util.waitForSpinner();

        // Get list of parameters
        var paramList = taskPage.getParams();

        // Verify we have the correct number of params
        expect(paramList.count()).toBe(1);
        Util.waitForSpinner();  //can't click until spinner is gone

        // Execute the task with default parameter values
        taskPage.getTaskButton().click();
        browser.waitForAngular();

        // Check the status and expect no errors
        expect(browser.getCurrentUrl()).toMatch(/\/#\/status/);
        expect(element(by.css('.alert-error')).isPresent()).toBeFalsy();

        // Expect download link
        expect(element(by.css('.btn.btn-secondary.pull-right.ml15.ng-scope')).isPresent()).toBeTruthy();
    });
});