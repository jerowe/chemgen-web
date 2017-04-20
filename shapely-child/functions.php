<?php

add_action( 'wp_enqueue_scripts', 'enqueue_parent_styles' );
function enqueue_parent_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri().'/style.css' );
}

require_once( 'wp-advanced-search/wpas.php');

//TODO This should go in my plugin - not my theme
function my_custom_search_form() {
    $args = array();

    $args['wp_query'] = array('post_type' => 'assay',
                              'posts_per_page' => 5);

    $args['fields'][] = array('type' => 'taxonomy',
                              'taxonomy' => 'wb_sequence_id',
                              'label' => 'WB Sequence Id',
                              'term_format' => 'name',
                              'format' => 'text',
                              'pre_html' => '<div class="row"> <div class="col-sm-3 form-group">',
                              'post_html' => '</div>',
                               );

    $args['fields'][] = array('type' => 'taxonomy',
                              'taxonomy' => 'condition',
                              'label' => 'Condition',
                              'term_format' => 'name',
                              'format' => 'text',
                              'pre_html' => ' <div class="col-sm-3 form-group">',
                              'post_html' => '</div>',
                               );

    $args['fields'][] = array('type' => 'taxonomy',
                              'taxonomy' => 'screen_name',
                              'label' => 'Screen Name',
                              'term_format' => 'name',
                              'format' => 'text',
                              'pre_html' => ' <div class="col-sm-3 form-group">',
                              'post_html' => '</div>',
                               );

    $args['fields'][] = array( 'type' => 'submit',
                           'class' => 'button',
                           'value' => 'Search',
                           'pre_html' => ' <div class="col-sm-3 form-group">',
                          );

    $args['fields'][] = array( 'type' => 'reset',
                           'class' => 'button',
                           'value' => 'Reset',
                           'post_html' => '</div></div>' );

    register_wpas_form('my-form', $args);
}

add_action('init', 'my_custom_search_form');

?>
