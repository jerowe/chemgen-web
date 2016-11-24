'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MyrouteCtrl
 * @description
 * # MyrouteCtrl
 * Controller of the chemgenClientApp
 */
angular.module('chemgenClientApp')
    .controller('MyrouteCtrl', function($scope, $http, $cookies) {

        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        var apiUrl = 'http://onyx.abudhabi.nyu.edu/wordpress/wp-json/wp/v2';

        var data = {
            title: 'this is a title',
            excerpt: 'this is an excerpt',
            content: 'this is some content!',
        };

        $http({
            method: 'POST',
            url: apiUrl + '/posts' + '/?context=edit&access_token=' + $cookies.get('wordpress_access_token'),
            data: data,
        }).then(function successCallback(response) {
            console.log('we got a response of ' + JSON.stringify(response));
        }, function errorCallback(error) {
            console.log('oh no there was an error!' + error);
        });



    });
