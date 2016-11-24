'use strict';

/**
 * @ngdoc function
 * @name chemgenClientApp.controller:FormlyCtrl
 * @description
 * # FormlyCtrl
 * Controller of the chemgenClientApp
 */
angular.module('chemgenClientApp')
    .controller('FormlyCtrl', function($scope, Plate, getFormlyPromise) {

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

        var setPlateOptions = function($scope) {
            getFormlyPromise.getFormlyData(Plate, '', ['csPlateid', 'name', 'platestarttime' ]).then(function(data) {
                $scope.options.templateOptions.options = data;
            });
        };

        var plate_fields = [{
            className: 'row',
            fieldGroup: [{
                className: 'col-xs-6',
                type: 'obj_typeahead',
                key: 'plateStart',
                templateOptions: {
                    label: 'Plate Start:',
                    required: true,
                    options: [],
                },
                controller: setPlateOptions,
                expressionProperties: {
                    'templateOptions.watch': function($viewValue, $modelValue, scope) {
                        getFormlyPromise.getFormlyData(Plate, $viewValue, ['csPlateid', 'name', 'platestarttime' ]).then(function(data) {
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

        vm.fields = [plate_fields[0]];

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
