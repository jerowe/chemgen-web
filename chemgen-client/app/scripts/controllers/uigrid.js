'use strict';

/**
 * @ngdoc function
 * @name chemgenClientApp.controller:UigridCtrl
 * @description
 * # UigridCtrl
 * Controller of the chemgenClientApp
 */

angular.module('chemgenClientApp')
    .controller('UigridCtrl', function($scope) {
        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        var vm = this;

        var columnDefs;

        columnDefs = [{
            name: 'State',
            field: 'name'
        }, {
            name: 'Abbr',
            field: 'abbr'
        }];

        vm.model = {
            list: [{
                "id": 0,
                "name": "Alabama",
                "abbr": "AL",
                "selected": false,
            }, {
                "id": 1,
                "selected": false,
                "name": "Alaska",
                "abbr": "AK"
            }, {
                "id": 2,
                "selected": false,
                "name": "American Samoa",
                "abbr": "AS"
            }, {
                "id": 3,
                "selected": false,
                "name": "Arizona",
                "abbr": "AZ"
            }]
        };

        vm.options = {
            formState: {
                uiGridCtrl: function($scope) {
                    $scope.to.onRegisterApi = function(gridApi) {
                        vm.gridApi = gridApi;
                    };
                }
            }
        };

        vm.fields = [{
            key: 'list',
            type: 'ui-grid',
            templateOptions: {
                label: 'Simple UI Grid',
                columnDefs: columnDefs,
                onRegisterApi: ''
            },
            controller: 'formState.uiGridCtrl'
        }];

        vm.originalFields = angular.copy(vm.fields);

        // function definition
        function onSubmit() {
            vm.options.updateInitialValue();

            var currentSelection = vm.gridApi.selection.getSelectedRows();

            for (var i = 0; i < currentSelection.length; i++) {
                var row = currentSelection[i];
                var id = row.id;

                var modelRow = vm.model.list[id];
                modelRow.selected = true;
                vm.model.list[id] = modelRow;
            }

            alert(JSON.stringify(vm.model), null, 2);
        }

        vm.onSubmit = onSubmit;
    });
