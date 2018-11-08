// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'starter.controllers',
  'starter.services',
  'starter.filters',
  'ngStorage',
  'angularMoment',
  'ngCordova',
  'ngCordovaOauth',
  'ngMask',
  'ion-digit-keyboard',
  'chart.js',
  'ngMask'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 1000);
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/dashboard');

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/pages/menu.html',
    controller: 'MainCtrl'
  })

  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/pages/dashboard.html',
        controller: 'DashboardCtrl'
      }
    }
  })

  .state('app.upcomingEvents', {
    url: '/upcomingEvents',
    views: {
      'menuContent': {
        templateUrl: 'templates/pages/upcomingEvents.html',
        controller: 'EventsCtrl'
      }
    }
  })

  .state('app.event', {
    url: '/event/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/pages/eventInformation.html',
        controller: 'EventCtrl'
      }
    }
  });

});
