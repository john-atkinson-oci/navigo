'use strict';

describe('Factory: taskService', function () {

    var $http, $q, taskService;

    var cfg = _.clone(config);

    beforeEach(function () {
        module('taskRunner');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$httpBackend_, _$q_, _taskService_) {
            $http = _$httpBackend_;
            $q = _$q_;
            taskService = _taskService_;
        });
    });

    // Specs here

    it('should get files', function () {

        var output = {children:[{format:'format', name:'name'}]};
        var statusResponse = {data:{id:'task', output:output}};
        var files = taskService.getFiles(statusResponse);

        expect(files.length).toBe(1);
        expect(files[0].downloadUrl).toContain(new RegExp('output'));
    });

    it('should get log files', function () {

        var output = {children:[{format:'format', name:'_stderr'},{format:'format', name:'_stdout'}]};
        var statusResponse = {data:{id:'task', output:output}};
        var files = taskService.getLogFiles(statusResponse);

        expect(files.length).toBe(2);
        expect(files[0].downloadUrl).toContain('_stderr');
        expect(files[1].downloadUrl).toContain('_stdout');

        expect(files[0].displayName).toBe('Processing Error Log');
        expect(files[1].displayName).toBe('Processing Output');
    });

    it('should get report', function () {

        var output = {children:[{format:'format', name:'_report'}]};
        var statusResponse = {data:{id:'task', output:output}};

        $http.expectGET(new RegExp('report')).respond({'report':'report'});

        taskService.getReport(statusResponse).then(function(data) {
            expect(data.report).toBe('report');
        });

        $http.flush();

    });
});