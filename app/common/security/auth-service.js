'use strict';

angular.module('voyager.security').
    factory('authService', function ($http, config, $q) {

        var observers = [];
        var errorCallback;
        var authCallback;
        var loggedIn = false;
        var permissions = {};
        var _user;
        var _groups = [];
        var _sso = true;
        var _isAnonymous = true;
        var _PERMISSIONS_LIST = 'check=manage&check=download&check=process&check=configure_view&check=save_search&check=share_saved_search&check=view&check=tag&check=edit_fields&check=flag';
        var _methods;

        function _setLoginState(response) {
            if (response) {
                _isAnonymous = response.data.state === 'anonymous';
                _user = response.data.user;
                permissions = response.data.permissions;
                observers.forEach(function (entry) {
                    entry(response);
                });
                if (authCallback) {
                    authCallback(response);
                    authCallback = null;
                }
                //console.log(response);
                if(response.data.user) {
                    loggedIn = true;
                    _sso = true;
                    _groups = response.data.user.groups;
                } else {
                    loggedIn = false; //logout success
                }
                if(response.data.methods) {
                    _methods = response.data.methods;
                }
            }
            return response;
        }

        var defaultErrorCallback = function (response) {
            if (response.error) {
                console.log(response.error);
            } else {
                console.log('failed');
            }
        };

        var doPost = function (request, action) {
            return $http({
                method: 'POST',
                url: config.root + 'api/rest/auth/' + action + '.json',
                data: request,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(_setLoginState, errorCallback);
        };

        function _getInfoUrl() {
            var url = config.root + 'api/rest/auth/info.json?' + _PERMISSIONS_LIST + '&r=' + new Date().getTime();
            if(_sso === false) {
                url += '&sso=false';
            }
            return url;
        }

        function _getPrivileges() {
            return $http.get(_getInfoUrl(),{cache: false, headers: {'Cache-Control' : 'no-cache'}}).then(_setLoginState, defaultErrorCallback);
        }

        // comment out by mayshi on 9/11/2015 because _getPrivileges is being fired twice
        // _getPrivileges();

        return {
            doLogin: function ($scope, successHandler, errorHandler) {
                errorCallback = errorHandler;
                authCallback = successHandler;
                var request = 'user=' + encodeURIComponent($scope.user) + '&pass=' + encodeURIComponent($scope.pass) + '&' + _PERMISSIONS_LIST;
                if($scope.keepLoggedIn === true) {
                    request += '&rememberMe=true';
                }
                // remove so we don't get a 419 here, we'll get a new one
                delete $http.defaults.headers.common['x-access-token'];
                return doPost(request, 'login');
            },
            doLogout: function () {
                //observers = [];
                authCallback = null;
                var request = 'check=manage';
                doPost(request, 'logout');
                loggedIn = false;
                _sso = false;
            },
            getPrivileges: function () {
                return _getPrivileges();
                // possibly make jsonp call here for IE 8 issue but server not set up
            },
            loadPrivileges: function() {
                if(_.isEmpty(permissions)) {
                    return _getPrivileges();
                } else {
                    return $q.when();
                }
            },
            addObserver: function (obs) {
                var exists = false;
                observers.forEach(function (entry) {
                    if (entry === obs) {
                        exists = true;
                    }
                });
                if (!exists) {
                    observers.push(obs);
                }
            },
            isLoggedIn: function () {
                return loggedIn;
            },

            isAnonymous: function () {
                return _isAnonymous;
            },

            hasPermission: function (type) {
                return permissions[type] && permissions[type] === true;
            },

            getUser: function() {
                return _user;
            },

            getGroups: function() {
                return _groups;
            },

            getGroupsJoined: function() {
                return _groups.join();
            },

            getUserInfo: function() {
                return $http.get(_getInfoUrl()).then(function(res) {
                    return res.data.user;
                });
            },

            fetchGroups: function() {
                return $http.get(config.root + 'api/rest/auth/info/groups').then(function(res) {
                    return res.data.groups;
                });
            },

            checkAccess: function() {
                _sso = true; //if they manually logged out
                return $http.get(_getInfoUrl()).then(function(res) {
                    var hasAccess = res.data.permissions.use_voyager;
                    if (hasAccess) {
                        _setLoginState(res);
                    }
                    return hasAccess;
                });
            },

            getMethods: function() {
                // test external
                // _methods = []; // remove comment for external only
                // _methods.push({name:'test',url:'http://www.google.com'});
                var methods = {all:_methods};
                methods.all = _methods.filter(function(method) {
                    return method.enabled === true;
                });
                methods.external = _.filter(_methods, function(method) {
                    method.displayName = _.classify(method.name);
                    return angular.isDefined(method.url) && method.enabled === true;
                });
                if(methods.external.length === 0) {
                    delete methods.external;
                }
                return methods;
            }
        };

    });