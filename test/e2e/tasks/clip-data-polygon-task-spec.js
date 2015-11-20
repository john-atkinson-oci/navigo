'use strict';

describe('Run Clip Data by Polygon Task', function() {

    var Util = require('../../lib/util.js');
    var s2Util = require('../../lib/s2-util.js');
    var searchPage = require('../../pages/search-page.js');
    var taskPage = require('../../pages/task-page.js');
    var taskStatusPage = require('../../pages/task-status-page.js');
    var server = Util.getServer();

    beforeEach(function() {
        searchPage.addAllToQueue('title:Hydrography_Lines');
        // Open Clip Data by Polygon task UI
        browser.get(server + '#/queue?disp=default&task=clip_data');
        Util.waitForSpinner();
    });

    it('should run using default parameter values', function() {
        // Get the task parameter elements.
        var paramList = taskPage.getParams();
        // Verify we have the correct number of params
        expect(paramList.count()).toBe(4);

        verifyDefaults(['', 'FileGDB', 'Same As Input']);

        taskPage.executeTask();
    });

    it('should run using Format: SHP', function() {

        setParams(2, 'Same As Input');

        taskPage.executeTask();
    });

    it('should run using Format: SHP and Projection: Web Mercator Auxiliary Sphere', function() {

        //// Search for results and add to queue
        //searchPage.addAllToQueue('title:ca_ozone_pts');
        //
        //browser.waitForAngular();
        //// Open Clip Data by Polygon task UI
        //browser.get(server + '#/queue?disp=default&task=clip_data');
        //
        //Util.waitForSpinner();

        // SHP should be 2nd item in list
        setParams(2, 'WGS 1984 Web Mercator (auxiliary sphere)');

        taskPage.executeTask();
    });

    afterEach(function() {
        verifyStatus();
    });

    function verifyDefaults() {
        // Verify default values for output format and projection
        var s2Elements = taskPage.getParameterValues();
        var expectedValues = ['', 'FileGDB', 'Same As Input'];
        for (var i = 0; i < expectedValues.length; ++i) {
            expect(s2Elements.get(i).getText()).toEqual(expectedValues[i]);
        }
    }

    function setParams(formatIndex, proj) {
        // Get the task parameter elements.
        var paramList = taskPage.getParams();
        // Verify we have the correct number of params
        expect(paramList.count()).toBe(4);

        return paramList.then(function(params) {
            var outputFormat = params[1];
            outputFormat.element(by.css('.select2-choice')).click();

            var lis = element.all(by.css('li.select2-results-dept-0'));
            return lis.then(function(li) {
                li[formatIndex-1].click();

                // now set the projection
                var projection = params[2];
                return s2Util.setText(projection, proj);
            });
        });
    }

    function verifyStatus() {
        // Verify there are no errors or warnings (warnings may be possible bug and to be investigated)
        expect(browser.getCurrentUrl()).toMatch(/\/#\/status/);
        expect(taskStatusPage.getSuccess().isPresent()).toBeTruthy();
        expect(taskStatusPage.getDownloadLink().isPresent()).toBeTruthy();
    }
});