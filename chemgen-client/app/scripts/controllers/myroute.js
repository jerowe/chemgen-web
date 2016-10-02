'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MyrouteCtrl
 * @description
 * # MyrouteCtrl
 * Controller of the chemgenClientApp
 */
angular.module('chemgenClientApp')
    .controller('MyrouteCtrl', function($scope, $http, $timeout, Plate) {

        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        //Total Number of Records

        $scope.gridOptions = {
            infiniteScrollRowsFromEnd: 5,
            infiniteScrollUp: true,
            infiniteScrollDown: true,
            columnDefs: [{
                name: 'csPlateid'
            }, {
                name: 'id'
            }, ],
            data: 'testmodels',
            onRegisterApi: function(gridApi) {
                gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.getDataDown);
                gridApi.infiniteScroll.on.needLoadMoreDataTop($scope, $scope.getDataUp);
                $scope.gridApi = gridApi;
            }
        };

        $scope.data = [];
        $scope.testmodels = [];
        $scope.dataSize = 100;
        $scope.firstPage = 1;
        $scope.lastPage = 1;
        //We should get this programatically on load
        $scope.maxLastPage = 1000;

        $scope.getDataDown = function() {
            console.log('getDataDown data is ' + $scope.lastPage);
            $scope.lastPage++;

            Plate
                .find({
                    filter: {
                        limit: $scope.dataSize,
                        skip: ($scope.lastPage - 1) * $scope.dataSize
                    }
                })
                .$promise
                .then(function(results) {
                    $scope.gridApi.infiniteScroll.saveScrollPercentage();
                    $scope.testmodels = $scope.testmodels.concat(results);
                    return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < $scope.maxLastPage).then(function() {
                        $scope.checkDataLength('up');
                    });
                })
                .catch(function() {
                    return $scope.gridApi.infiniteScroll.dataLoaded();
                });
        };

        $scope.getDataUp = function() {
            console.log('getDataUp data is ' + $scope.firstPage);
            $scope.firstPage--;
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < $scope.maxLastPage).then(function() {
                $scope.checkDataLength('down');
            });
        };

        $scope.checkDataLength = function(discardDirection) {
            // work out whether we need to discard a page, if so discard from the direction passed in
            if ($scope.lastPage - $scope.firstPage > $scope.maxLastPage - 1) {
                // we want to remove a page
                $scope.gridApi.infiniteScroll.saveScrollPercentage();

                if (discardDirection === 'up') {
                    $scope.testmodels = $scope.testmodels.slice(100);
                    $scope.firstPage++;
                    $timeout(function() {
                        // wait for grid to ingest data changes
                        $scope.gridApi.infiniteScroll.dataRemovedTop($scope.firstPage > 0, $scope.lastPage < $scope.maxLastPage);
                    });
                } else {
                    $scope.testmodels = $scope.testmodels.slice(0, 400);
                    $scope.lastPage--;
                    $timeout(function() {
                        // wait for grid to ingest data changes
                        $scope.gridApi.infiniteScroll.dataRemovedBottom($scope.firstPage > 0, $scope.lastPage < $scope.maxLastPage);
                    });
                }
            }
        };

        function getPlate() {
            Plate
                .find({
                    filter: {
                        limit: $scope.dataSize
                    }
                })
                .$promise
                .then(function(results) {
                    $scope.testmodels = results;
                });
        }

        getPlate();

        $scope.reset = function() {
            $scope.firstPage = 2;
            $scope.lastPage = 2;

            // turn off the infinite scroll handling up and down - hopefully this won't be needed after @swalters scrolling changes
            $scope.gridApi.infiniteScroll.setScrollDirections(false, false);
            $scope.data = [];

            $scope.getFirstData().then(function() {
                $timeout(function() {
                    // timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
                    $scope.gridApi.infiniteScroll.resetScroll($scope.firstPage > 0, $scope.lastPage < 4);
                });
            });
        };

        $scope.getFirstData = function() {
            console.log('first data is ' + $scope.lastPage);
        };

    });
