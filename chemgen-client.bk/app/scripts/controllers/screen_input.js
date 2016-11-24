'use strict';

/**
 * @ngdoc function
 * @name chemgenClientApp.controller:ScreenInputCtrl
 * @description
 * # ScreenInputCtrl
 * Controller of the chemgenClientApp
 */

angular.module('chemgenClientApp')
    .controller('ScreenInputCtrl', function($scope, MainScreen) {

        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $scope.formOptions = {
            formState: $scope.formState
        };

        $scope.options = {
            key: {}
        };

        var vm = this;

        vm.originalFields = angular.copy(vm.fields);

        vm.model = {
        };

        var name = {
            key: 'name',
            type: 'input',
            templateOptions: {
                placeholder: 'name',
                label: 'Name',
                required: true,
            },
        };

        var description = {
            key: 'description',
            type: 'input',
            templateOptions: {
                placeholder: 'description',
                label: 'Description',
                required: true,
            },
        };

        vm.fields = [name, description];

        vm.onSubmit = function() {
            MainScreen.create({name: "test", description: "test description"})
                .$promise
                .then(function(results){
                    console.log('results are ' + JSON.stringify(results));
                });
        };

    });
