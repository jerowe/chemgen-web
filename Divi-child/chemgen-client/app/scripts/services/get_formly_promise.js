'use strict';

/**
 * @ngdoc service
 * @name chemgenClientApp.getFormlyPromise
 * @description
 * # getFormlyPromise
 * Service in the chemgenClientApp.
 */
angular.module('chemgenClientApp')
    .service('getFormlyPromise', function($q) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        function gen_filter(val) {
            return {
                filter: {
                    limit: 15,
                    where: {
                        name: {
                            like: '%' + val + '%'
                        }
                    }
                }
            };
        }

        function retOptionsList(results, display) {

            var names = [];
            for (var i in results) {
                var result = results[i];

                var display_val = []
                for (var x in display) {
                    var d = display[x];
                    display_val.push(result[d]);
                }
                var val = display_val.join("\t");
                names.push(val);

            }

            return names;
        }

        function retOptionsObject(results, display) {

            var names = [];
            for (var i in results) {
                var result = results[i];

                var display_val = {};
                for (var x in display) {
                    var d = display[x];
                    display_val[d] = result[d];
                }
                names.push(display_val);
            }

            return names;
        }

        return {
            getFormlyData: function(Model, search_val, display) {

                var deffered = $q.defer();

                Model
                    .find(gen_filter(search_val))
                    .$promise
                    .then(function(results) {
                        var names = retOptionsList(results, display);
                        deffered.resolve(names);
                    });

                return deffered.promise;
            },
            getPlateList: function(Plate, plate) {

                var deffered = $q.defer();

                Plate.find({
                        filter: {
                            where: {
                                csPlateid: {
                                    between: [plate.plateStart, plate.plateEnd]
                                }
                            }
                        }
                    })
                    .$promise
                    .then(function(results) {
                        var plateIds = results.map(function(obj) {
                            //This is only for the chemical library
                            //var plateInfo = obj.name.split('M');

                            var newObj = {csPlateid: obj.csPlateid, barcode: obj.name, imagePath: obj.imagepath};
                            return newObj;
                        });
                        deffered.resolve(plateIds);
                    });

                return deffered.promise;

            },
            getFormlyObject: function(Model, search_val, display) {

                var deffered = $q.defer();

                Model
                    .find(gen_filter(search_val))
                    .$promise
                    .then(function(results) {
                        var names = retOptionsObject(results, display);
                        deffered.resolve(names);
                    });

                return deffered.promise;
            }
        };
    });
