'use strict';

describe('Controller: JobsCtrl', function () {

    var $scope, $timeout, $location, $http, $controller, $window;
    var cfg = _.clone(config);

    beforeEach(function () {

        module('ui.router');
        module('voyager.util');
        module('voyager.filters');
        module('voyager.config');
        module('taskRunner');
        module(function ($provide) {
            $provide.constant('config', cfg);
        });

        inject(function (_$controller_, _$timeout_, _$location_, $httpBackend) {
            $scope = {};
            $timeout = _$timeout_;
            $location = _$location_;
            $http = $httpBackend;
            $controller = _$controller_;
            $window = {location:{href:''}};
        });

    });

    // Specs here
    var jobs = [];
    jobs.push({id:'id', output_name:['_file','file'], task:'task', state:'PENDING', json:'{"params":[{"type":"VoyagerResults","query":{"fq":["filter:field"]}}]}'});
    jobs.push({id:'id2', task:'task2', state:'RUNNING'});
    jobs.push({id:'id3', task:'task3', state:'FAILED'});
    jobs.push({id:'id4', task:'task4', state:'CANCELED'});
    jobs.push({id:'id5', task:'task5', state:'WARNING'});
    jobs.push({id:'id6', task:'task6', state:'COMPLETE'});

    function initJobsCtrl() {
        $controller('JobsCtrl', {
            $scope: $scope, $window: $window, $stateParams:{q:'text'}
        });

        $http.expectJSONP(new RegExp('jobs')).respond({response: {docs: jobs}}); //jobs call
        $http.expectJSONP(new RegExp('tasks')).respond({response: {docs: [{id:'id', name:'task', task:'task', display:'taskDisplay'}]}});  //tasks call
        $http.flush();

        expect($scope.jobs.length).toBe(jobs.length);
        expect($scope.jobs[0].displayName).toEqual('taskDisplay');
        expect($scope.jobs[1].displayName).toEqual('Task2');
    }

    it('should init', function () {
        initJobsCtrl();
    });

    it('should view items', function () {
        initJobsCtrl();

        $location.search().disp = 'disp';

        $scope.viewItems(jobs[0]);

        expect($window.location).toMatch(new RegExp(escapeRegExp('search?disp=disp&fq=filter:field')));
    });

    it('should download', function () {
        initJobsCtrl();

        $scope.download(jobs[0]);

        expect($window.location.href).toMatch(new RegExp(escapeRegExp('output/file')));

        $scope.download(jobs[1]);

        expect($window.location.href).toMatch(new RegExp(escapeRegExp('status/id2')));
    });

    it('should run', function () {
        initJobsCtrl();

        $scope.run(jobs[0]);

        $http.expectPOST(new RegExp(escapeRegExp('process/job/' + jobs[0].id + '/run.json'))).respond({});
        $http.flush();
    });

    it('should check done', function () {
        initJobsCtrl();

        expect($scope.isDone(jobs[1].state)).toBeFalsy();
    });

    it('should go back', function () {
        initJobsCtrl();

        $scope.goBack();

        expect($window.location.href).toMatch(new RegExp(escapeRegExp('q=text')));
    });

});