<?php
function my_scripts() {

    //Styles

    wp_enqueue_style(
        'bootstrap',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/bootstrap/dist/css/bootstrap.min.css'
    );

    wp_enqueue_style(
        'font-awesome',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/font-awesome/css/font-awesome.css'
    );

    wp_enqueue_style(
        'bootstrap-social',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/bootstrap-social/bootstrap-social.css'
    );

    wp_enqueue_style(
        'metis-menu',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/metisMenu/dist/menisMenu.css'
    );

    wp_enqueue_style(
        'angular-wizard',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-wizard/dist/angular-wizard.min.css'
    );

    //bower_components/lightgallery/dist/css/lightgallery.min.css
    //bower_components/fotorama/fotorama.css
    wp_enqueue_style(
        'fotorama-style',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/fotorama/fotorama.css'
    );

    //Scripts
    wp_enqueue_script(
        'angularjs',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular/angular.js'
    );

    wp_enqueue_script(
        'angularjs-route',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-route/angular-route.js'
    );

    wp_enqueue_script(
        'angularjs-cookies',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-cookies/angular-cookies.min.js'
    );

    wp_enqueue_script(
        'bootstrap-script',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js'
    );

    wp_enqueue_script(
        'bootstrap-ui-script',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js'
    );

    wp_enqueue_script(
        'angularjs-animate',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-animate/angular-animate.min.js'
    );

    wp_enqueue_script(
        'angularjs-resource',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-resource/angular-resource.js'
    );

    wp_enqueue_script(
        'angularjs-sanitize',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-sanitize/angular-sanitize.js'
    );

    wp_enqueue_script(
        'angularjs-touch',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-touch/angular-touch.js'
    );

    wp_enqueue_script(
        'api-check',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/api-check/dist/api-check.js'
    );

    wp_enqueue_script(
        'angularjs-formly',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-formly/dist/formly.js'
    );

    wp_enqueue_script(
        'angularjs-formly-bootstrap',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.js'
    );

    wp_enqueue_script(
        'angularjs-wizard',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-wizard/dist/angular-wizard.min.js'
    );

    wp_enqueue_script(
        'angularjs-formly-repeating',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/angular-formly-repeating-section/dist/angular-formly-repeating-section.js'
    );

    //Main Application Script
    wp_enqueue_script(
        'my-scripts',
        get_stylesheet_directory_uri() . '/chemgen-client/app/scripts/app.js',
        array( 'angularjs', 'angularjs-route' )
    );

    //Services
    wp_enqueue_script(
        'loopback-service',
        get_stylesheet_directory_uri() . '/chemgen-client/app/scripts/services/lb-service.js'
    );

    wp_enqueue_script(
        'formly-service',
        get_stylesheet_directory_uri() . '/chemgen-client/app/scripts/services/get_formly_promise.js'
    );

    //Controllers
    wp_enqueue_script(
        'main-controller',
        get_stylesheet_directory_uri() . '/chemgen-client/app/scripts/controllers/main.js',
        array( 'angularjs', 'angularjs-route' )
    );

    wp_enqueue_script(
        'experiment-controller',
        get_stylesheet_directory_uri() . '/chemgen-client/app/scripts/controllers/experiment_input.js',
        array( 'angularjs', 'angularjs-route' )
    );

    wp_enqueue_script(
        'fotorama-scripts',
        get_stylesheet_directory_uri() . '/chemgen-client/bower_components/fotorama/fotorama.js'
    );

    wp_localize_script(
        'my-scripts',
        'myLocalized',
        array(
            'partials' => trailingslashit( get_stylesheet_directory_uri() ) . 'partials/',
            'views' => trailingslashit( get_stylesheet_directory_uri() ) . '/chemgen-client/app/',
            'nonce' => wp_create_nonce( 'wp_rest'  )
            )
    );

}

add_action( 'wp_enqueue_scripts', 'my_scripts'  );
