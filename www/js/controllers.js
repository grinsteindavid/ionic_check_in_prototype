angular.module('starter.controllers', [])

.controller('MainCtrl', function MainCtrl($scope, $state, $ionicModal, $http, $localStorage, $cordovaOauth, $ionicHistory, $ionicLoading, $ionicPopup, AuthService) {
  console.log('MainCtrl');
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  //DEBUGG <---------------
  /**$localStorage.$reset({
    settings: {
      token: '10155360704442758'
  }});**/

  //DEBUGG <---------------

  /**$scope.user = {
    first_name: 'david',
    last_name: 'miranda',
    contact: {
      client: {
        name: 'sway nightclub',
        phone_status: 1
      }
    }
  };**/
  $scope.user = {};
  $scope.loginModal = {};
  $scope.auth = false;

  $ionicHistory.clearHistory();

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/modals/login.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose: false,
    hardwareBackButtonClose: false
  }).then(function(modal) {
    $scope.loginModal = modal;

    if (AuthService.check()) {
      AuthService.header('token', $localStorage.settings.token);
      $scope.loginModal.show();
      $ionicLoading.show();
      console.log('token', $localStorage.settings.token);
      
      $http.get(AuthService.api + '/validateLogin').then(function(response) {
        console.log('AuthService validateLogin response ->', response);

        AuthService.header('X-Authorization', response.data.contact.client.api_key);
        AuthService.header('token', response.data.contact.app_token);
        $scope.user = response.data;
        $ionicLoading.hide();
        $scope.loginModal.hide();
        $scope.auth = true;
        $scope.$broadcast('login', { dateTime: moment().format('MMMM Do YYYY, h:mm:ss a')});
      }, function(response) {
        console.log('AuthService login response ->', response);
        AuthService.reset();
        $ionicLoading.hide();
        $scope.showAlert('Alert', response.data);
      });

    } else {
      $localStorage.$default({
        settings: {}
      });

      console.log('LocalStorage auth check -> ', $localStorage);
      $scope.loginModal.show();
    }
  });

  $scope.logIn = function () {
    $ionicLoading.show();

    $http.post(AuthService.api + '/login', {
      email: $scope.user.email,
      password: $scope.user.password
    }).then(function (response) {
      console.log('AuthService login response ->', response);

      $localStorage.settings.token = response.data.contact.app_token;
      AuthService.header('X-Authorization', response.data.contact.client.api_key);
      AuthService.header('token', response.data.contact.app_token);
      $scope.user = response.data;
      $ionicLoading.hide();
      $scope.loginModal.hide();
      $scope.auth = true;
      $scope.$broadcast('login', { dateTime: moment().format('MMMM Do YYYY, h:mm:ss a') });
    }, function (response) {
      console.log('AuthService login response ->', response);
      $ionicLoading.hide();
      $scope.showAlert('Alert', response.data);
    });
  };

  $scope.logOut = function() {
    $scope.auth = false;
    AuthService.reset();

    $scope.user = {};
    $scope.loginModal.show();
    $state.go('app.dashboard');
  };

  $scope.showAlert = function(title, message) {
    $ionicPopup.alert({
      title: title,
      template: message
    });
  };
})

.controller('DashboardCtrl', function DashboardCtrl($scope, $filter, $http, $timeout, $ionicModal, $ionicLoading, $ionicPopup, AuthService) {
  console.log('DashboardCtrl');

  $scope.data = [];

  $scope.$on('login', function (event, data) {
    console.log(data);
    getDashboardData();
  });

  $scope.$on('$ionicView.enter', function (event) {
    console.log('$ionicView.enter');
    if ($scope.auth) {
      getDashboardData();
    }
  });

  $scope.doRefresh = function () {
    $timeout(function () {
      getDashboardData();
      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    }, 500);
  };

  function getDashboardData() {
    $ionicLoading.show();
    
    $http.get(AuthService.api + '/dashboardData').then(function (response) {
      console.log('DashboardData response ->', response);
      $scope.data = response.data;
      $ionicLoading.hide();
    }, function (response) {
      console.log('DashboardData response ->', response);
      $ionicLoading.hide();
      if ($scope.auth) {
        $scope.showAlert('Alert', response.data);
      }
    });
  }
})

.controller('GuestListCtrl', function GuestListCtrl($scope, $filter, $http, $timeout, $ionicModal, $ionicLoading, $ionicPopup, AuthService) {
  console.log('GuestListCtrl');

  $scope.searchResults = [];

  $scope.$on('$ionicView.enter', function (event) {
    console.log('$ionicView.enter');
    $scope.searchResults = [];
  });

  $scope.findBy = function (search) {
    console.log(search, isNaN(search));
    if (!isNaN(search)) {
      findByPhone(search);
      console.log($scope.searchResults);
    } else {
      findByName(search);
    }
  };

  function findByName(search) {
    $scope.searchResults = $scope.event.rsvp.filter(function (rsvp) {
      return (rsvp.first_name.toLowerCase() + ' ' + rsvp.last_name.toLowerCase()).includes(search.toLowerCase());
    });
  }

  function findByPhone(search) {
    $scope.searchResults = $scope.event.rsvp.filter(function (rsvp) {
      return rsvp.phone.includes(search);
    });
  }

  $scope.guestPlus = function (guestGenre) {
    console.log(guestGenre + ' Before plus ->', $scope.rsvp);
    if ($scope.rsvp[guestGenre] < $scope.event.max_rsvp) {
      $scope.rsvp[guestGenre]++;
      $scope.updateGuests();
      console.log(guestGenre + ' Plus ->', $scope.rsvp);
    }
  };

  $scope.guestMinus = function (guestGenre) {
    console.log(guestGenre + ' Before minus ->', $scope.rsvp);
    if ($scope.rsvp[guestGenre] > 0) {
      $scope.rsvp[guestGenre]--;
      $scope.updateGuests();
      console.log(guestGenre + ' Minus ->', $scope.rsvp)
    }
  };

  $scope.updateGuests = function() {
    $scope.rsvp.guests = Number($scope.rsvp.male) + Number($scope.rsvp.female);
  };

  $scope.sendCheckIn = function() {
    $ionicLoading.show();
    $http.post(AuthService.api + '/checkin', {
      rsvp_id: $scope.rsvp.id,
      male: $scope.rsvp.male,
      female: $scope.rsvp.female
    }).then(
      function (response) {
        console.log('sendCheckIn response ->', response);
        $ionicLoading.hide();
        $scope.showAlert('Alert', response.data);
        $scope.checkInConfirm.hide();
        $scope.getEvent();
      },
      function (response) {
        console.log('sendCheckIn response ->', response);
        $ionicLoading.hide();
        $scope.showAlert('Alert', response.data);
        $scope.checkInConfirm.hide();
        $scope.getEvent();
      }
    );
  };

})

.controller('EventCtrl', function EventCtrl($scope, $stateParams, $filter, $http, $timeout, $ionicModal, $ionicLoading, $ionicPopup, AuthService) {
  console.log('EventCtrl');
  
  $scope.rsvp = {};
  $scope.event = {};

  $scope.$on('$ionicView.enter', function(event) {
    console.log('$ionicView.enter');
    if ($scope.auth) {
      $scope.getEvent();
    }    
  });

  $scope.doRefreshEvent = function () {
    $timeout(function () {
      $scope.getEvent();
      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    }, 500);
  };

  $scope.getEvent = function () {
    $ionicLoading.show();
    $http.get(AuthService.api + '/eventInformation/' + $stateParams.id).then(
      function (response) {
        console.log('getEvent response ->', response);
        $ionicLoading.hide();
        $scope.event = response.data;
        $scope.labelsChart = ["RSVP", "Check-in"];
        $scope.dataChart = [$scope.event.rsvp.length, $scope.event.rsvp.filter(function (rsvp, index) {
          return rsvp.checkin;
        }).length];
      },
      function (response) {
        console.log('getEvent response ->', response);
        $ionicLoading.hide();
        $scope.showAlert('Alert', 'An error has occurred, try again later.');
      }
    );
  };

  $scope.showCheckInConfirm = function (rsvp) {
    $scope.rsvp = rsvp;
    $scope.checkInConfirm.show();
    console.log('showCheckInConfirm rsvp ->', $scope.rsvp);
  };

  $scope.openCheckInTally = function () {
    $scope.rsvp = {
      male: 0,
      female: 0,
      guests: 0,
      phone: ''
    };
    $scope.checkInTally.show();
    console.log('openCheckInTally rsvp ->', $scope.rsvp);
  };

  $scope.sendTallyForm = function() {
    $ionicLoading.show();

    $http.post(AuthService.api + '/tallyForm', {
      event_id: $scope.event.id,
      first_name: $scope.rsvp.first_name,
      last_name: $scope.rsvp.last_name,
      male: $scope.rsvp.male,
      female: $scope.rsvp.female,
      phone: $scope.rsvp.phone,
      email: $scope.rsvp.email
    }).then(
      function (response) {
        console.log('sendTallyForm response ->', response);
        $ionicLoading.hide();
        $scope.showAlert('Alert', response.data);
        $scope.checkInTally.hide();
        $scope.getEvent();
      },
      function (response) {
        console.log('sendTallyForm response ->', response);
        $ionicLoading.hide();
        $scope.showAlert('Alert', response.data);
        $scope.checkInTally.hide();
        $scope.getEvent();
      }
    );
  };

  $ionicModal.fromTemplateUrl('templates/modals/guestlist.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose: true,
    hardwareBackButtonClose: true
  }).then(function (modal) {
    $scope.guestList = modal;
  });
  
  $ionicModal.fromTemplateUrl('templates/modals/check-in-list.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose: true,
    hardwareBackButtonClose: true
  }).then(function (modal) {
    $scope.checkIn = modal;
  });
  
  $ionicModal.fromTemplateUrl('templates/modals/check-in-form.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose: false,
    hardwareBackButtonClose: false
  }).then(function (modal) {
    $scope.checkInConfirm = modal;
  });

  $ionicModal.fromTemplateUrl('templates/modals/check-in-tally-form.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose: false,
    hardwareBackButtonClose: false
  }).then(function (modal) {
    $scope.checkInTally = modal;
  });
})

.controller('EventsCtrl', function EventsCtrl($scope, $filter, $http, $timeout, $ionicModal, $ionicLoading, $ionicPopup, AuthService) {
  console.log('EventsCtrl');

  //$scope.event = {};
  $scope.events = [];
  $scope.search = '';
  $scope.searchResults = [];

  $scope.$on('$ionicView.enter', function (event) {
    console.log('$ionicView.enter');
    if ($scope.auth) {
      getUpcomingEvents();
    }
  });

  $scope.doRefresh = function() {
    $timeout(function() {
      getUpcomingEvents();
      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    }, 500);
  };

  $scope.findBy = function(search) {
    console.log('Search data ->', search, isNaN(search));
    if (isNaN(search)) {
      findByName(search);
      console.log('searchResults ->', $scope.searchResults);
    }
  };

  function findByName(search) {
    $scope.searchResults = $scope.events.filter(function(event) {
      return event.title.toLowerCase().includes(search.toLowerCase());
    });
  }

  function getUpcomingEvents() {
    $ionicLoading.show();
    $http.get(AuthService.api + '/upcomingEvents').then(
      function(response) {
        console.log('getUpcomingEvents response ->', response);
        $ionicLoading.hide();
        $scope.events = response.data;
      },
      function(response) {
        console.log('getUpcomingEvents response ->', response);
        $ionicLoading.hide();
        $scope.showAlert('Alert', 'An error has occurred, try again later.');
      }
    );
  };
})
