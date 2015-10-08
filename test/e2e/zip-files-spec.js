'use strict';

describe('Zip Files Task', function() {

    var Util = require('../lib/util.js');

    var server = Util.getServer();

    function _addFileTypeToQueue() {
        browser.get(server + '#/search?fq=format_type:File');

        Util.waitForSpinner();

        var addToQueueAnchor = element(by.css('.underline.icon-plus'));
        addToQueueAnchor.click();
    }

    it('should load zip_files task', function() {
        _addFileTypeToQueue();

        browser.get(server + '#/queue?disp=default&task=zip_files');

        var paramList = element.all(by.repeater('p in params'));

        //verify we have the correct number of params
        expect(paramList.count()).toBe(2);

        Util.waitForSpinner();  //can't click until spinner is gone
        Util.waitForSpinner();  //can't click until spinner is gone

        element(by.css('[ng-click="execTask()"]')).click();

        browser.waitForAngular();

        expect(browser.getCurrentUrl()).toMatch(/\/#\/status/);

        expect(element(by.css('.alert-error')).isPresent()).toBeFalsy();
    });
});