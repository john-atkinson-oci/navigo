'use strict';


describe('Zip Files Task', function() {

    var Util = require('../../lib/util.js');
    var searchPage = require('../../pages/search-page.js');
    var taskPage = require('../../pages/task-page.js');
    var taskStatusPage = require('../../pages/task-status-page.js');
    var server = Util.getServer();

    // Load and run Zip Files task
    it('should load zip_files task', function() {
        searchPage.addAllToQueue('title:ca_ozone_pts');

        browser.get(server + '#/queue?disp=default&task=zip_files');
        Util.waitForSpinner();

        // Get list of parameters
        var paramList = taskPage.getParams();

        // Verify we have the correct number of params
        expect(paramList.count()).toBe(2);
        Util.waitForSpinner();  //can't click until spinner is gone

        // Execute the task with default parameter values
        taskPage.getTaskButton().click();
        browser.waitForAngular();

        // Check the status; expect no errors; expect download link
        taskStatusPage.verifyStatus();
        taskStatusPage.verifySuccess();
        taskStatusPage.verifyDownloadLink();
    });
});