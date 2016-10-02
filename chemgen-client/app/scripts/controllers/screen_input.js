'use strict';

/**
 * @ngdoc function
 * @name chemgenClientApp.controller:ScreenInputCtrl
 * @description
 * # ScreenInputCtrl
 * Controller of the chemgenClientApp
 */
angular.module('chemgenClientApp')
    .controller('ScreenInputCtrl', function($scope, getPlates) {

        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];
        console.log('in screenInput Ctrl!');

        $scope.formOptions = {
            formState: $scope.formState
        };

        $scope.options = {
            key: {}
        };

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
                required: true,
                placeholder: 'Enter email'
            }
        };

        var reagent_type = {
            key: 'screen_type',
            type: 'typeahead',
            templateOptions: {
                label: 'Screen Type',
                required: true,
                placeholder: 'RNAi',
                options: ['RNAi', 'Chemical', 'RNAi+Chemical']
            },
        };

        var temperature = {
            key: 'temperature',
            type: 'typeahead',
            templateOptions: {
                label: 'Temperature',
                required: true,
                placeholder: 50,
                options: Array.apply(null, Array(300)).map(function (_, i) {return i;}),
            },
        };

        var screen_options = [{
            name: "Yes",
            value: "1"
        }, {
            name: "No",
            value: "0"
        }];

        var screen_types = [{
            className: 'row',
            fieldGroup: [{
                className: 'col-xs-4',
                type: "radio",
                key: "enhancer",
                templateOptions: {
                    options: screen_options,
                    label: "Is this screen an enhancer?",
                    required: true
                },
            }, {
                type: "radio",
                key: "duplicate",
                className: 'col-xs-4',
                templateOptions: {
                    options: screen_options,
                    label: "Is this screen a duplicate?",
                    required: true
                }
            }, {
                type: "radio",
                key: "suppressor",
                className: 'col-xs-4',
                templateOptions: {
                    options: screen_options,
                    label: "Is this screen a suppressor?",
                    required: true
                }
            }]
        }];

        vm.fields = [email, reagent_type, temperature, screen_types[0], plate_fields[0], repeatSection];

        vm.onSubmit = function() {
            console.log(JSON.stringify(vm.model));
        };

        vm.onSelect = function($item, $model, $label) {
            console.log('ITEM ' + JSON.stringify($item));
            $scope.$item = $item;
            $scope.$model = $model;
            $scope.$label = $label;
        };

    });
