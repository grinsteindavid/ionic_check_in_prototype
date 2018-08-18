angular.module('starter.services', [])

.factory('AuthService', function($state, $http, $localStorage) {
  
  this.api = 'http://textblasts.atnight.com/api/contact';
  //this.api = 'localhost:8000/api/v1/tb';

  this.header = function(name, value) {
    $http.defaults.headers.common[name] = value;
  };
  
  this.redirect = function(name, params) {
    $state.go(name, params);
  };
  
  this.check = function() {
    return $localStorage.settings && $localStorage.settings.token;
  };

  return {
    api: this.api,
    header: this.header,
    redirect: this.redirect,
    check: this.check
  };
});
