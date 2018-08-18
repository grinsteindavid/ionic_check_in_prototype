angular.module('starter.filters', [])

.filter('birthday', function() {
    function calculateAge(birthday) { // birthday is a date
        var birthday = moment(birthday).fromNow();
        return birthday.replace('years ago', '');
    }

    return function(birthdate) { 
        return calculateAge(birthdate);
    }; 
})

.filter('phone', function() {
    function formatPhone(phone) {
		return "(" + phone.substring(0, 3) + ") " + phone.substring(3, 6) + "-" + phone.substring(6, 10);
    }

    return function(phone) { 
       return formatPhone(phone);
    }; 
})

.filter('date', function() {
    function formatDate(date) {
        var date = moment(date).format("ddd, MMM DD, YYYY");
        
        return date;
        }

    return function(date) { 
        return formatDate(date);
    }; 
})

.filter('ampm', function () {
    function formatDate(date) {
        var date = moment(moment().format('MMM DD, YYYY') + ' ' + date).format("hh: mm A");

        return date;
    }

    return function (date) {
        return formatDate(date);
    };
})

.filter('dateHour', function() {
    function formatDate(date) { // birthday is a date
        var date = moment(date).format("HH:mm A ddd, MMM DD, YYYY");
        
        return date;
        }

    return function(date) { 
        return formatDate(date);
    }; 
})

.filter('ucwords', function() {
    function ucwords(str) {
        console.log('ucwords: ', str)
        str = str.toLowerCase();
        return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
        function(s) {
          return s.toUpperCase();
        });
    }

    return function(str) { 
        if (str && str.length) return ucwords(str);
    }; 
})