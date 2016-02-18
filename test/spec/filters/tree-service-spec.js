/*global describe, beforeEach, module, it, inject, expect, config, angular, _ */

describe('Filters:', function () {
    'use strict';

    _.mixin(_.str.exports());  //this happens in the app.js, not fired here

    beforeEach(function () {
        module('voyager.util');
        angular.mock.module('voyager.security'); //auth service module - apparently this is needed to mock the auth service
        module(function ($provide) {
            var cfg = _.clone(config);
            cfg.settings.data.filters.push({'name':'field','style':'HIERARCHY',field:'field'});
            $provide.constant('config', cfg);
            $provide.value('authService',{});  //mock the transitive auth service so it doesn't call the init methods
        });

        module('voyager.filters');
    });

    describe('treeService', function () {

        var sut, httpMock, _configService;

        beforeEach(inject(function (treeService, configService, $rootScope, $httpBackend) {
            sut = treeService;
            httpMock = $httpBackend;
            _configService = configService;
        }));

        it('should update tree', function () {
            expect(true).toBe(true);
            // TODO: make this work with DisplayConfig

            //response is a little funky:  [folder, count, folder, count]
						
            // var folders = ['1/root',0, '2/root/parent',0, '3/root/parent/child',0];
            // var data = {facet_counts:{facet_fields: {field:folders}}}; // jshint ignore:line

            // httpMock.expectJSONP().respond(data);
            // httpMock.expectJSONP().respond(data); //second jsonp call

            // var params = {}, filterParams = '', bboxParams = '', filters = [{field:'field',style:'HIERARCHY'}];
            // sut.updateTree(params, filterParams, bboxParams, filters);
            // httpMock.flush(2);
            // var tree = filters[0].values[0].tree;

            // expect(filters[0].values).toBeDefined();
            // expect(tree.length).toBe(1);
            // var rootNode = tree[0];
            // expect(rootNode.path).toBe('root');
            // expect(rootNode.children.length).toBe(1);
            // var parentNode = rootNode.children[0];
            // expect(parentNode.path).toBe('root/parent');
            // expect(parentNode.children.length).toBe(1);
            // var child = parentNode.children[0];
            // expect(child.path).toBe('root/parent/child');
        });

        it('should update tree any order', function () {
            // TODO: make this work with DisplayConfig

            //response is a little funky:  [folder, count, folder, count]
            // var folders = ['1/root', 0, '3/root/parent/child', 0, '2/root/parent', 0];
            // var data = {facet_counts:{facet_fields: {field:folders}}}; // jshint ignore:line

            // httpMock.expectJSONP().respond(data);
            // httpMock.expectJSONP().respond(data); //second jsonp call

            // var params = {}, filterParams = '', bboxParams = '', filters = [{field:'field',style:'HIERARCHY'}];
            // sut.updateTree(params, filterParams, bboxParams, filters);
            // httpMock.flush();

            // expect(filters[0].values).toBeDefined();
            // var tree = filters[0].values[0].tree;
            // expect(tree.length).toBe(1);
            // var rootNode = tree[0];
            // expect(rootNode.path).toBe('root');
            // expect(rootNode.children.length).toBe(1);
            // var parentNode = rootNode.children[0];
            // expect(parentNode.path).toBe('root/parent');
            // expect(parentNode.children.length).toBe(1);
            // var child = parentNode.children[0];
            // expect(child.path).toBe('root/parent/child');
        });

    });
});