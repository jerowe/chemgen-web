'use strict';

/**
 * @ngdoc function
 * @name chemgenClientApp.controller:ExperimentInputCtrl
 * @description Map Screens to Database
 *
 * There is a lot going on this form, it is making both GET and POST requests.
 *
 * || Action || Form Label || Form Model || DB Table              || DB Columns                ||
 * | GET     | Screen      | screen      | MainScreen             |  screenId, name            |
 * | GET     | Library     | library     | ReagentsReagentlibrary |  reagentlibraryId, name    |
 * | POST    | Assay Type  | assay_type  | ExperimentAssay        |  assay_type                |
 * | GET     | Instrument  | instrument  | MainInstrument         |  id, name                  |
 * | POST    | Instrument  | instrument  | ExperimentPlate        |  instrument_id             |
 * | GET     | PlateStart  | plateStart  | ExperimentPlate        |  instrument_plate_id       |
 * | POST    | Is Junk?    | junk        | ExperimentAssay        |  is_junk                   |
 * | POST    | Screen Stage| junk        | ExperimentPlate        |  screen_stage              |
 *
 * Controller of the chemgenClientApp
 */

angular.module('chemgenClientApp')
    .controller('ExperimentInputCtrl', function($scope, $http, $cookies, Plate, MainScreen, MainOrganism, ReagentsReagentlibrary, MainInstrument, getFormlyPromise) {

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

        //////////////////////////////////////////////////////////
        // Start Formly Form Configuration
        //////////////////////////////////////////////////////////

        var vm = this;

        var wordpressAccessToken = $cookies.get('wordpress_access_token');
        var wordpressUserId = $cookies.get('wordpress_user_id');

        vm.model = {
            currentDate: (new Date()),
            plates: []
        };

        vm.model1 = {};
        vm.model2 = {
            plates: []
        };

        vm.exitValidation = function(form) {
            return form && !form.$invalid;
        };

        vm.finishWizard = finishWizard;

        function finishWizard() {
            processFormData();
            vm.success = "Your screen was submitted successfully";
        }

        var FormData = new Object();

        function processFormData() {
            //Take care of all the GET data from the form

            console.log('We are processing form data!');
            //MainScreen
            var screen_data = vm.model.screen.split("\t");
            FormData.screenId = screen_data[0];
            FormData.screenName = screen_data[1];

            //ReagentsReagentlibrary
            var library_data = vm.model.library.split("\t");
            FormData.libraryId = library_data[0];
            FormData.libraryName = library_data[1];

            //ExperimentAssay
            //FormData.assay_type = vm.model.assay_type;

            //ExperimentAssay
            FormData.junk = vm.model.junk;

            //MainInstrument
            var instrument_data = vm.model.instrument.split("\t");
            FormData.instrumentId = instrument_data[0];
            FormData.instrumentName = instrument_data[1];

            //ExperimentPlate
            FormData.temperature = vm.model.temperature;
            FormData.screenStage = vm.model.screen_stage;
            FormData.date = vm.model.currentDate;

            console.log('form data temperature is ' + FormData.temperature);
            //ToDo Move this all to server side processing
            processFormDataPlates();
        };

        function processFormDataPlates() {
            FormData.plates = [];

            var plateStart_data = vm.model.plateStart.split("\t");
            var plateEnd_data = vm.model.plateEnd.split("\t");

            //This gets us the plateId from the HCS DB - we need to query for the whole list

            var plateData = {
                plateStart: plateStart_data[0],
                plateEnd: plateEnd_data[0]
            };

            FormData.plates.push(plateData);

            processFormDataPlateObj();

            console.log("FormData Obj is " + JSON.stringify(FormData));

            $http({
                method: 'POST',
                data:  {wpAT: wordpressAccessToken, wpUI: wordpressUserId, FormData: FormData},
                url: 'http://onyx.abudhabi.nyu.edu:3000/getPlateList'
            }).then(function successCallback(response) {
                console.log('we got a response of ' + response);
            }, function errorCallback(error){
                console.log('oh no there was an error!' + error);
            });
        };


        function processFormDataPlateObj() {

            for (var i in vm.model.plates) {
                var plate = vm.model.plates[i];

                if('plateStart' in plate){

                  if(plate.plateStart && plate.plateEnd){

                    var plateStart_data = plate.plateStart.split("\t");
                    var plateEnd_data = plate.plateEnd.split("\t");

                    var plateData = {
                      plateStart: plateStart_data[0],
                      plateEnd: plateEnd_data[0]
                    };
                    FormData.plates.push(plateData);
                    
                  }

                }
            }
        }

        var setFormlyOptions = function(Model, searchValue, scope, display) {
            getFormlyPromise.getFormlyData(Model, searchValue, display).then(function(data) {
                scope.options.templateOptions.options = data;
            });
        };

        //////////////////////////////////////////////////////////
        // End Formly Form Configuration
        //////////////////////////////////////////////////////////

        //////////////////////////////////////////////////////////
        // Start Screen
        //////////////////////////////////////////////////////////

        var screenDisplay = ['screenId', 'name'];

        var setScreenOptions = function($scope) {
            setFormlyOptions(MainScreen, '', $scope, screenDisplay);
        };

        var screen_field = {
            className: 'col-xs-6',
            key: 'screen',
            type: 'typeahead',
            templateOptions: {
                label: 'Screen',
                required: true,
                options: [],
            },
            controller: setScreenOptions,
            expressionProperties: {
                'templateOptions.watch': function($viewValue, $modelValue, scope) {
                    setFormlyOptions(MainScreen, $viewValue, scope, screenDisplay);
                }
            },
        };

        //////////////////////////////////////////////////////////
        // End Screen
        //////////////////////////////////////////////////////////

        //////////////////////////////////////////////////////////
        // Start Organism
        //////////////////////////////////////////////////////////

        var strainDisplay = ['organismId', 'name'];

        var setStrainOptions = function($scope) {
            setFormlyOptions(MainOrganism, '', $scope, strainDisplay);
        };

        var strain_field = {
            className: 'col-xs-6',
            key: 'strain',
            type: 'typeahead',
            templateOptions: {
                label: 'Strain',
                required: true,
                options: [],
            },
            controller: setStrainOptions,
            expressionProperties: {
                'templateOptions.watch': function($viewValue, $modelValue, scope) {
                    setFormlyOptions(MainOrganism, $viewValue, scope, screenDisplay);
                }
            },
        };

        //////////////////////////////////////////////////////////
        // End Screen
        //////////////////////////////////////////////////////////

        //////////////////////////////////////////////////////////
        // Start Instrument
        //////////////////////////////////////////////////////////

        var instrumentDisplay = ['instrumentId', 'name'];

        var setInstrumentOptions = function($scope) {
            setFormlyOptions(MainInstrument, '', $scope, instrumentDisplay);
        };

        var instrument_field = {
            key: 'instrument',
            type: 'typeahead',
            templateOptions: {
                label: 'Instrument',
                required: true,
                options: [],
            },
            controller: setInstrumentOptions,
            expressionProperties: {
                'templateOptions.watch': function($viewValue, $modelValue, scope) {
                    setFormlyOptions(MainInstrument, $viewValue, scope, instrumentDisplay);
                }
            },
        };

        //////////////////////////////////////////////////////////
        // End Screen
        //////////////////////////////////////////////////////////


        //////////////////////////////////////////////////////////
        // Start Plates
        //////////////////////////////////////////////////////////

        var plateDisplay = ['csPlateid', 'name', 'platestarttime'];

        var setPlateOptions = function($scope) {
            setFormlyOptions(Plate, '', $scope, plateDisplay);
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
                        setFormlyOptions(Plate, $viewValue, scope, plateDisplay);
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
                        setFormlyOptions(Plate, $viewValue, scope, plateDisplay);
                    }
                },
            }]
        }];

        var plate_repeat_section = {
            key: 'plates',
            type: 'repeatSection',
            templateOptions: {
                btnText: 'Add another plate group',
                fields: plate_fields,
            },
        };

        //////////////////////////////////////////////////////////
        // End Plates
        //////////////////////////////////////////////////////////

        //////////////////////////////////////////////////////////
        // Start Reagent Libraries
        //////////////////////////////////////////////////////////

        var reagentDisplay = ['reagentlibraryId', 'name'];

        var setReagentOptions = function($scope) {
            setFormlyOptions(ReagentsReagentlibrary, '', $scope, reagentDisplay);
        };

        var library_field = {
            className: 'col-xs-6',
            key: 'library',
            type: 'typeahead',
            templateOptions: {
                label: 'Library',
                placeholder: 'fda',
                required: true,
                options: [],
            },
            expressionProperties: {
                'templateOptions.watch': function($viewValue, $modelValue, scope) {
                    setFormlyOptions(ReagentsReagentlibrary, $viewValue, scope, reagentDisplay);
                }
            },
            controller: setReagentOptions,
        };

        //////////////////////////////////////////////////////////
        // End Reagent Libraries
        //////////////////////////////////////////////////////////

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

        //TODO get rid of this - we just get this from the library
        // var assay_type = {
        //     className: 'col-xs-4',
        //     key: 'assay_type',
        //     type: 'typeahead',
        //     templateOptions: {
        //         label: 'Assay Type',
        //         required: true,
        //         placeholder: 'RNAi',
        //         options: ['RNAi', 'Chemical', 'RNAi+Chemical']
        //     },
        // };

        var temperature_options = [{
            name: "22.5C Enhancer",
            value: "22.5"
        }, {
            name: "25C Suppressor",
            value: "25"
        }];

        var temperature = {
            className: 'col-xs-4',
            type: "radio",
            key: "temperature",
            templateOptions: {
                options: temperature_options,
                label: "Temperature",
                required: true
            },
        };

        var junk_options = [{
            name: "Yes",
            value: "1"
        }, {
            name: "No",
            value: "0"
        }];

        var junk_field = {
            className: 'col-xs-4',
            type: "radio",
            key: "junk",
            templateOptions: {
                options: junk_options,
                label: "Is this screen junk?",
                required: true
            },
        };

        var screen_stage_options = [{
            name: "Primary",
            value: 1
        }, {
            name: "Secondary",
            value: 2
        }];

        var screen_stage_field = {
            className: 'col-xs-4',
            type: "radio",
            key: "screen_stage",
            templateOptions: {
                label: "Screen Stage",
                required: true,
                options: screen_stage_options
            },
        };

        var screen_fields = {
            className: 'row',
            fieldGroup: [screen_stage_field, junk_field, temperature]
        };

        var main_fields = {
            className: 'row',
            fieldGroup: [screen_field,  library_field]
        };

        /////////////////////////////////////////////////////////////////////
        // Start Configure Formly Fields
        /////////////////////////////////////////////////////////////////////

        var step1_fields = [main_fields,  screen_fields];

        var step2_fields = [instrument_field, plate_fields[0], plate_repeat_section];

        vm.fields = {
            step1: step1_fields,
            step2: step2_fields
        };

        vm.originalFields = angular.copy(vm.fields);

        /////////////////////////////////////////////////////////////////////
        // End Configure Formly Fields
        /////////////////////////////////////////////////////////////////////

    });
