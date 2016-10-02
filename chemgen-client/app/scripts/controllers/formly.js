'use strict';

/**
 * @ngdoc function
 * @name chemgenClientApp.controller:FormlyCtrl
 * @description
 * # FormlyCtrl
 * Controller of the chemgenClientApp
 */
angular.module('chemgenClientApp')
    .controller('FormlyCtrl', function($scope, getPlates) {

        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        var vm = this;

        vm.originalFields = angular.copy(vm.fields);

        vm.model = {
            currentDate: (new Date()).toDateString(),
            plates: []
        };

        var setPlateOptions = function($scope, getPlates) {
            getPlates.getFormPlate('').then(function(data) {
                $scope.options.templateOptions.options = data;
            });
        };

        var plate_fields = [{
            className: 'row',
            fieldGroup: [{
                className: 'col-xs-6',
                type: 'typeahead',
                key: 'plateStart',
                templateOptions: {
                    label: 'Plate Start:',
                    required: true,
                    options: [],
                },
                controller: setPlateOptions,
                expressionProperties: {
                    'templateOptions.watch': function($viewValue, $modelValue, scope) {
                        getPlates.getFormPlate($viewValue).then(function(data) {
                            scope.options.templateOptions.options = data;
                        });
                    }
                },
            }, {
                className: 'col-xs-6',
                type: 'typeahead',
                key: 'plateEnd',
                templateOptions: {
                    label: 'Plate End:',
                    required: true,
                    options: [],
                },
                controller: setPlateOptions,
                expressionProperties: {
                    'templateOptions.watch': function($viewValue, $modelValue, scope) {
                        getPlates.getFormPlate($viewValue).then(function(data) {
                            scope.options.templateOptions.options = data;
                        });
                    }
                },
            }]
        }];

        var repeatSection = {
            key: 'plates',
            type: 'repeatSection',
            templateOptions: {
                btnText: 'Add another plate group',
                fields: plate_fields,
            },
        };

        var email = {
            key: 'email',
            type: 'input',
            templateOptions: {
                type: 'email',
                label: 'Email address',
                placeholder: 'Enter email'
            }
        };

        var screen_options = [{
            name: "Yes",
            value: "1"
        }, {
            name: "No",
            value: "0"
        }];

        var screen_types = [{
            'type': "radio",
            'key': "enhancer",
            templateOptions: {
                options: screen_options,
                label: "This this screen an enhancer?",
                required: true
            },
        }, {
            'type': "radio",
            'key': "duplicate",
            templateOptions: {
                options: screen_options,
                label: "This this screen a duplicate?",
                required: true
            }
        }, {
            type: "radio",
            key: "suppressor",
            templateOptions: {
                options: screen_options,
                label: "This this screen a suppressor?",
                required: true
            }
        }];

        vm.fields = [email, screen_types[0], screen_types[1], screen_types[2], plate_fields[0], repeatSection];

        $scope.formOptions = {
            formState: $scope.formState
        };

        $scope.options = {
            key: {}
        };

        vm.onSubmit = function() {
            console.log(JSON.stringify(vm.model));
        };

        $scope.onSelect = function($item, $model, $label) {

            console.log('ITEM ' + JSON.stringify($item));
            $scope.$item = $item;
            $scope.$model = $model;
            $scope.$label = $label;
        };

        var onEdit = function() {
            console.log('in on edit');
        };

        //vm.setPlateOptions = setPlateOptions;
        $scope.onEdit = onEdit;
        vm.onEdit = onEdit;

    });
