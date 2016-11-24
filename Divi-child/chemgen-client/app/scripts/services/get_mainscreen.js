'use strict';

/**
 * @ngdoc service
 * @name chemgenClientApp.getMainscreen
 * @description
 * # getMainscreen
 * Service in the chemgenClientApp.
 */
angular.module('chemgenClientApp')
  .service('getMainscreen', function ($q, MainScreen) {

        return {
            getMainScreen: function(val) {
                console.log("IN GET FORMPLATE");
                var deffered = $q.defer();
                MainScreen
                    .find({
                        filter: {
                            limit: 15,
                            where: {
                                name: {
                                    like: '%' + val + '%'
                                }
                            }
                        }
                    })
                    .$promise
                    .then(function(results) {
                        var names = [];
                        for (var i = 0; i < results.length; i++) {
                            var result = results[i];
                            var val = result.screenId + "\t" + result.name + "\t" + result.description;
                            result.display = val;
                            results[i] = result;
                            //names.push(result);
                            names.push(val);
                        }
                        deffered.resolve(names);
                    });
                return deffered.promise;
            }
        };
  });
