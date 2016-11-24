<?php

wp_localize_script( 'wp-api', 'wpApiSettings', array( 'root' => esc_url_raw( rest_url()  ), 'nonce' => wp_create_nonce( 'wp_rest'  )  )  );

require 'custom/functions-login.php';

add_action( 'wp_enqueue_scripts', 'theme_enqueue_styles' );
function theme_enqueue_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array('parent-style')
    );
}

require 'custom/angular-enqueue.php';

?>
