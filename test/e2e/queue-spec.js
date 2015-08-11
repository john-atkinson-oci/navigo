'use strict';

describe('Queue', function() {

    var Util = require('../lib/util.js');

    function _showTasks() {
        var selectTaskButton = element(by.id('runTaskBtn'));
        Util.waitForSpinner();
        selectTaskButton.click();
    }

    //need to add an item to the queue first
    it('should add to queue', function() {
        browser.get('http://127.0.0.1:9000/#/search');

        var addToQueueAnchor = element(by.css('.underline.icon-plus'));
        addToQueueAnchor.click();
    });

    it('should load queue page', function() {
        browser.get('http://127.0.0.1:9000/#/queue?disp=default');

        var items = element.all(by.repeater('item in cartItems'));
        expect(items.count()).toBe(1);
    });

    it('should show task list', function() {
        browser.get('http://127.0.0.1:9000/#/queue?disp=default');

        var items = element.all(by.repeater('item in cartItems'));
        expect(items.count()).toBe(1);

        _showTasks();

        var taskList = element.all(by.repeater('task in taskList'));
        expect(taskList.count()).toBeGreaterThan(0);
    });

});