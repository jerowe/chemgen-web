'use strict';

/**
 * @ngdoc service
 * @name chemgenClientApp.getReagentsReagentlibrary
 * @description
 * # getReagentsReagentlibrary
 * Service in the chemgenClientApp.
 */
angular.module('chemgenClientApp')
  .service('getReagentsReagentlibrary', function ($q,  ReagentsReagentlibrary  ) {
    //"ReagentsReagentlibrary",
    // AngularJS will instantiate a singleton by calling "new" on this function
        return {
            getLibrary: function(val) {
                var deffered = $q.defer();
                ReagentsReagentlibrary
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
                            var val = result.reagentlibraryId + "\t" + result.name;
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
