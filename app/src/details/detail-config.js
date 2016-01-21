'use strict';

angular.module('voyager.details').
    factory('detailConfig', function(config, $q, configService, translateService, configLoader) {

        var displayFields;
        if(config.settings) {
            displayFields = config.settings.data.display.fields;
        }

        //summary
        var _summaryFields = [];
        var _summaryInclusions = {};
        var _summaryParams = '';
        var _summaryFieldsOrder = {};
        //detail
        var inclusions = {};
        var _displayFieldsOrder = {};
        var displayParams = '';
        var _showAllFields = false;
        var _editable = {};
        var _styles = {};
        var _summaryStyles = {};

        var _showPath = true;
        var _showFormat = true;

        var excludePrefix = config.excludeDetails;

        function _setInclusions() {
            $.each(displayFields, function (index, value) {
                inclusions[value.name] = value.name;
                _styles[value.name] = value.style;
                displayParams += ', ' + value.name;
                _displayFieldsOrder[value.name] = index;
                _editable[value.name] = value.editable;
            });
        }

        function _setSummaryInclusions() {
            $.each(_summaryFields, function (index, value) {
                _summaryInclusions[value.name] = value.name;
                _summaryStyles[value.name] = value.style;
                _summaryParams += ', ' + value.name;
                _summaryFieldsOrder[value.name] = index;
            });
        }

        function _load(configId) {
            var deferred = $q.defer();
            configLoader.prepare().then(function() {
                translateService.init();
                configService.getConfigDetails(configId).then(function(response) {
                    var display = response.data.display;
                    if(display.path === false) {
                        _showPath = false;
                    }
                    if(display.ref === false) {
                        _showFormat = false;
                    }
                    displayFields = response.data.display.fields;
                    _showAllFields = response.data.display.showAllFields;
                    if (response.data.summary) {
                        _summaryFields = response.data.summary.fields;
                        _setSummaryInclusions();
                    }
                    _setInclusions();
                    deferred.resolve();
                });
            });
            return deferred.promise;
        }

        function _exclude(name){
            var index =_.findIndex(excludePrefix, function(prefix) {
                return name.indexOf(prefix) === 0 || name === prefix;
            });
            return index !== -1;
        }

        function _getFields(doc, fields) {
            var prettyFields = [];
            var emptyFields = _.clone(inclusions);
            var isArray = false;

            //var exclusions = {'id':true, 'name':true,'format':true,'path':true,'thumb':true,'preview':true,'download':true,'bbox':true,'title':true};
            var formattedValue = '';
            $.each(doc, function (name, value) {

                if ((inclusions[name] || _showAllFields === true) && angular.isDefined(fields[name]) && fields[name].displayable === true) {
                    delete emptyFields[name];
                    if (!_exclude(name)) {

                        formattedValue = value;
                        isArray = false;
                        var formattedValues = {};

                        if (_.isArray(value)) {
                            formattedValue = value.join(', ');
                            isArray = true;
                            formattedValues = _.indexBy(value);
                        }

                        if (name === 'format') {
                            formattedValue = translateService.getType(value);
                        }
                        if (name === 'contains_mime') {
                            if (_.isArray(value)) {
                                formattedValues = {};  //overwrite with actual formatted values
                                _.each(value, function (val) {
                                    formattedValues[val] = translateService.getType(val);
                                });
                                //formattedValue = formattedValues.join();
                            } else {
                                formattedValue = translateService.getType(value);
                            }
                        }
                        if (name === 'location') {
                            formattedValue = translateService.getLocation(value);
                        }
                        if (_styles[name] === 'STRIP_HTML') {
                            formattedValue = $('<p>' + value + '</p>').text();
                        }

                        var isHtml = false;
                        if (_styles[name] === 'HTML') {
                            isHtml = true;
                        }
                        if (value.length > 100 && !isHtml) {
                            _styles[name] = 'STRING'; //so it doesn't become a link
                        }
                        prettyFields.push({
                            'name': translateService.getFieldName(name),
                            stype: fields[name].stype,
                            isArray: isArray,
                            'value': value,
                            formattedValue: formattedValue,
                            formattedValues: formattedValues,
                            order: _displayFieldsOrder[name],
                            editable: _editable[name],
                            key: name,
                            style: _styles[name],
                            isHtml: isHtml
                        });
                    }
                }
                if (name === 'abstract' && !_.isEmpty(doc.abstract)) {
                    doc.displayDescription = _.last(prettyFields); // jshint ignore:line
                } else if (name === 'description' && !_.isEmpty(doc.description)) {
                    doc.displayDescription = _.last(prettyFields);
                }

            });

            //fields without values aren't returned in the query results, display those that are editable
            $.each(emptyFields, function (name) {
                if(_editable[name] === true) {
                    prettyFields.push({name: translateService.getFieldName(name), value: '', formattedValue: '', order:_displayFieldsOrder[name], editable: true, key:name});
                }
            });

            return _.sortBy(prettyFields, 'order');
        }

        function _getSummaryFields(doc, fields) {
            var prettyFields = [];

            //var exclusions = {'id':true, 'name':true,'format':true,'path':true,'thumb':true,'preview':true,'download':true,'bbox':true,'title':true};
            var formattedValue = '';
            $.each(doc, function (name, value) {
                // TODO - this fields array is the full fields index and gets cached locally - may get out of sync after new fields added to index until browser refresh
                if (_summaryInclusions[name] && fields[name] && fields[name].displayable === true) {
                    if(_.isArray(value)) {
                        value = value.join(', ');
                    }
                    formattedValue = value;
                    if(name === 'format') {
                        formattedValue = translateService.getType(value);
                    }
                    if(name === 'contains_mime') {
                        if(_.isArray(value)) {
                            var formattedValues = [];
                            _.each(value, function(val) {
                                formattedValues.push(translateService.getType(val));
                            });
                            formattedValue = formattedValues.join();
                        } else {
                            formattedValue = translateService.getType(value);
                        }
                    }
                    if(_summaryStyles[name] === 'STRIP_HTML') {
                        formattedValue = $('<p>' + value + '</p>').text();
                    }
                    var isHtml = false;
                    if(_styles[name] === 'HTML') {
                        isHtml = true;
                    }
                    prettyFields.push({'name': translateService.getFieldName(name), 'value': value, formattedValue: formattedValue, order:_summaryFieldsOrder[name], key:name, style: _summaryStyles[name], isHtml: isHtml});
                }
            });

            return _.sortBy(prettyFields, 'order');
        }

        return {
            load: _load,

            showPath: function() {return _showPath;},

            showFormat: function() {return _showFormat;},

            getFields: _getFields,

            getSummaryFields: _getSummaryFields
        };

    });
