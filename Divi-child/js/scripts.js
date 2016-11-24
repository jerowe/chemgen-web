angular.module('app', [
        'ngRoute',
        'ngAnimate',
        'ngCookies',
        'ngSanitize',
        'ngTouch',
        'ngResource',
        'lbServices',
        'formly',
        'formlyBootstrap',
        'formlyRepeatingSection',
        'ui.bootstrap',
        'mgo-angular-wizard'
    ])
    .config(function(LoopBackResourceProvider) {

        // Change the URL where to access the LoopBack REST API server
        LoopBackResourceProvider.setUrlBase('http://onyx.abudhabi.nyu.edu:3000/api');

    })
    .config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl: myLocalized.partials + 'main.html',
                controller: 'Main'
            });
    })
    .config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {

        $httpProvider.interceptors.push([function() {
            return {
                'request': function(config) {
                    config.headers = config.headers || {};
                    //add nonce to avoid CSRF issues
                    config.headers['X-WP-Nonce'] = myLocalized.nonce;
                    return config;
                }
            };
        }]);
    }])
    .controller('Main', function($http, $cookies) {
        console.log('Main file loaded.');

        var apiUrl = 'http://onyx.abudhabi.nyu.edu/wordpress/wp-json/wp/v2';

        var data = {
            title: 'this is a title',
            excerpt: 'this is an excerpt',
            content: '<b>this</b> is some content!',
        };

        //$http({
        //method: 'GET',
        //url: apiUrl + '/users',
        //data: data,
        //}).then(function successCallback(response) {
        //console.log('we got a response of ' + JSON.stringify(response));
        //}, function errorCallback(error) {
        //console.log('oh no there was an error!' + error);
        //});

        //&access_token=' + $cookies.get('wordpress_access_token'),
        //$http({
            //method: 'POST',
            //url: apiUrl + '/posts/75' + '/?context=edit',
            //data: data,
        //}).then(function successCallback(response) {
            //console.log('we got a response of ' + JSON.stringify(response));
        //}, function errorCallback(error) {
            //console.log('oh no there was an error!' + error);
        //});

    });
