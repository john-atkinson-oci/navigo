'use strict';

angular.module('voyager.security').
    factory('authService', function ($http, config, $q, $log) {

        var observers = [];
        var errorCallback;
        var authCallback;
        var loggedIn = false;
        var permissions = {};
        var _user;
        var _groups = [];
        var _sso = true;
        var _isAnonymous = true;
        var _PERMISSIONS = ['manage','download','process','configure_view','save_search','share_saved_search','view','tag','edit_fields','flag','view_tags'];
        var _PERMISSIONS_LIST = 'check=' + _PERMISSIONS.join('&check=');
        var _methods;

        function _setLoginState(response) {
            if (response) {
                _isAnonymous = angular.isUndefined(response.data.state) || response.data.state === 'anonymous';
                _user = response.data.user;
                if(response.data.permissions) {
                    permissions = response.data.permissions;
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

                observers.forEach(function (entry) {
                    entry(response);
                });
                if (authCallback) {
                    authCallback(response);
                    authCallback = null;
                }
            }
            return response;
        }

        var defaultErrorCallback = function (response) {
            permissions = {};
            _isAnonymous = true;
            if (response.error) {
                $log.error('auth failed: ' + response.error);
            } else {
                $log.error('auth failed: ' + JSON.stringify(response));
            }
            observers.forEach(function (entry) {
                entry(response);
            });
            return response;
        };

        var doPost = function (request, action) {
            return $http({
                method: 'POST',
                url: config.root + 'api/rest/auth/' + action + '.json',
                data: request,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    response.action = action;
                    _setLoginState(response);
                }, errorCallback
            );
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

        _getPrivileges();
        return {
            doLogin: function ($scope, successHandler, errorHandler) {
                errorCallback = errorHandler;
                authCallback = successHandler;
                var request = 'user=' + encodeURIComponent($scope.user) + '&pass=' + encodeURIComponent($scope.pass) + '&' + _PERMISSIONS_LIST;
                if($scope.keepLoggedIn === true) {
                    request += '&rememberMe=true';
                }
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
                var index = _.findIndex(observers, obs);
                if (index === -1) {
                    observers.push(obs);
                }
            },
            removeObserver: function (obs) {
                observers = _.without(observers, obs);
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
                if(angular.isDefined(_methods)) {
                    methods.all = _methods.filter(function (method) {
                        return method.enabled === true;
                    });
                    methods.external = _.filter(_methods, function (method) {
                        method.displayName = _.classify(method.name);
                        return angular.isDefined(method.url) && method.enabled === true;
                    });
                    if (methods.external.length === 0) {
                        delete methods.external;
                    }
                } else {
                    methods.all = [];
                }
                return methods;
            },

            showLogout: function() {
                var show = true;
                var methods = this.getMethods().all;
                // only enforce if windows is the only method enabled
                if (methods.length === 1 && methods[0].name === 'windows') {
                    var windowsAuth = methods[0];
                    // only enforce if some sso is enabled
                    if (windowsAuth.enableNtlm === true || windowsAuth.enableNegotiate === true) {
                        show = !windowsAuth.hideLogout;
                    }
                } else if (methods.length > 1) {  // if there are multiple methods and sso, show logout for admin only
                    var self = this;
                    _.each(methods, function(method) {
                        // hide if they aren't an admin (let admin see multiple methods)
                        if(method.name === 'windows' && !self.hasPermission('manage')) {
                            // only enforce if some sso is enabled
                            if (method.enableNtlm === true || method.enableNegotiate === true) {
                                show = !method.hideLogout;
                            }
                        }
                    });
                }
                return show;
            }
        };

    });