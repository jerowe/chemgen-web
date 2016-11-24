'use strict';

/**
 * @ngdoc overview
 * @name chemgenClientApp
 * @description
 * # chemgenClientApp
 *
 * Main module of the application.
 */
//'ui.grid.autoResize',
//'ui.grid.pagination',
//'ui.grid.edit',
//'ui.grid.rowEdit',
        //'ui.grid',
        //'ui.grid.selection',
        //'ui.grid.infiniteScroll',
//
angular
    .module('chemgenClientApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
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
    .config(function(formlyConfigProvider) {

        formlyConfigProvider.setType({
            name: 'typeahead',
            templateUrl: myLocalized.views + 'views/plate_typeahead.html',
            wrapper: ['bootstrapLabel', 'bootstrapHasError']
        });

        formlyConfigProvider.setType({
            name: 'obj_typeahead',
            templateUrl: myLocalized.views + 'views/object_typeahead.html',
            wrapper: ['bootstrapLabel', 'bootstrapHasError']
        });

    })
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: myLocalized.views + 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/experiment_input', {
              templateUrl: myLocalized.views + 'views/experiment_input.html',
              controller: 'ExperimentInputCtrl',
              controllerAs: 'experimentInput'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
