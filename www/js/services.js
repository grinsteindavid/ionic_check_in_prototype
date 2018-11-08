angular.module('starter.services', [])

.factory('AuthService', function($state, $http, $localStorage) {
  
  this.api = 'http://textblasts.atnight.com/api/contact';
  //this.api = 'localhost:8200/api/v1/contact';

  this.header = function(name, value) {
    $http.defaults.headers.common[name] = value;
  };
  
  this.redirect = function(name, params) {
    $state.go(name, params);
  };
  
  this.check = function() {
    return $localStorage.settings && $localStorage.settings.token;
  };

  this.reset = function () {
    $http.defaults.headers.common['token'] = null;
    $localStorage.$reset({
      settings: {}
    });
    return true;
  };

  return {
    api: this.api,
    header: this.header,
    redirect: this.redirect,
    check: this.check,
    reset: this.reset
  };
});
