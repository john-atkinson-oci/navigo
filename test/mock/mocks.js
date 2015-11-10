'use strict';

//var config = {fields:{data:{fields:[]}}};
config.fields = {data:{fields:[], FIELD:[], FIELD_DESCR:[]}};
config.fileFormats = {data:{VALUE:{format:''}}};
config.locations = {data:{VALUE:{location:''}}};
config.settings = {'data':{'display':{'fields':[{'name':'field'}]}}};
config.settings.data.filters = [];
config.root = 'root/';
config.require = {locations:'api/rest/i18n/field/location.json'};
config.rawFields = {};
config.ui = {details:{}, list:{name:'Queue'}};
//config.settings.data.showFederatedSerach = true;