'use strict';

/**
 * @ngdoc service
 * @name chemgenClientApp.getExperimentExperimentplate
 * @description
 * # getExperimentExperimentplate
 * Service in the chemgenClientApp.
 */
angular.module('chemgenClientApp')
    .service('getExperimentExperimentplate', function($q, ExperimentExperimentplate) {

        return {
            getExperimentPlate: function(val) {
                console.log("IN GET FORMPLATE");
                var deffered = $q.defer();
                ExperimentExperimentplate
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
                            var val = result.csPlateid + "\t" + result.name + "\t" + result.platestarttime;
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
