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
    .config(function(formlyConfigProvider) {

        formlyConfigProvider.setType({
            name: 'typeahead',
            templateUrl: 'views/plate_typeahead.html',
            wrapper: ['bootstrapLabel', 'bootstrapHasError']
        });

        formlyConfigProvider.setType({
            name: 'obj_typeahead',
            templateUrl: 'views/object_typeahead.html',
            wrapper: ['bootstrapLabel', 'bootstrapHasError']
        });

        //formlyConfigProvider.setType({
        //name: 'ui-grid',
        //template: '<div ui-grid="{ data: model[options.key], columnDefs: to.columnDefs, onRegisterApi: to.onRegisterApi}" ui-grid-selection  ></div>',
        //wrapper: ['bootstrapLabel', 'bootstrapHasError']
        //});

    })
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                controllerAs: 'about'
            })
            .when('/hcs_plates', {
                templateUrl: 'views/hcs_plates.html',
                controller: 'HcsPlatesCtrl',
                controllerAs: 'hcsPlates'
            })
            .when('/myroute', {
                templateUrl: 'views/myroute.html',
                controller: 'MyrouteCtrl',
                controllerAs: 'myroute'
            })
            .when('/screen_input', {
                templateUrl: 'views/screen_input.html',
                controller: 'ScreenInputCtrl',
                controllerAs: 'screenInput'
            })
            .when('/formly', {
                templateUrl: 'views/formly.html',
                controller: 'FormlyCtrl',
                controllerAs: 'formly'
            })
            .when('/uigrid', {
                templateUrl: 'views/uigrid.html',
                controller: 'UigridCtrl',
                controllerAs: 'uigrid'
            })
            .when('/experiment_input', {
                templateUrl: 'views/experiment_input.html',
                controller: 'ExperimentInputCtrl',
                controllerAs: 'experimentInput'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
