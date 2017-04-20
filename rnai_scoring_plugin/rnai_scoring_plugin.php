<?php
/*
Plugin Name: Rnai Scoring Plugin
Plugin URI: http://awesomelypopularplugin.com
Description: Some helper functions for scoring RNAi
Version: 1.0
Author: Jillian Rowe
Author URI: github_url_here/jerowe
License: GPL2
*/

///////////////////////////////////////////
//Begin Add Actions
///////////////////////////////////////////

//Add REST

include_once('helpers.php');

add_action('rest_api_init', 'rnai_register_api_hooks');

function rnai_register_api_hooks()
{
    register_rest_route('rnai_screen/v1', '/params', array(
    'methods' => 'GET',
    'callback' => 'rnai_rest_callback',
  ));
}

function rnai_rest_callback(WP_REST_Request $request)
{
    $params = $request->get_params();
    $custom_query = rnai_build_query($params);

    return $custom_query;
}

//Add AJAX
add_action( 'wp_ajax_nopriv_rnai_scoring_ajax_action', 'rnai_scoring_ajax_action' );
add_action( 'wp_ajax_rnai_scoring_ajax_action', 'rnai_scoring_ajax_action' );

function rnai_scoring_ajax_action() {

  $custom_query = rnai_build_query($_POST);
  rnai_loop_posts($custom_query);
  die();
}

//Add Enqueue
add_action( 'wp_enqueue_scripts', 'rnai_scoring_enqueue_scripts' );

function rnai_scoring_enqueue_scripts() {

	wp_enqueue_script( 'rnai_scoring', plugins_url( '/assets/js/rnai_scoring_plugin.js', __FILE__  ), array('jquery') );

	wp_localize_script( 'rnai_scoring', 'rnai_scoring', array(
		'ajax_url' => admin_url( 'admin-ajax.php' )
	));
}

///////////////////////////////////////////
//End Add Actions
///////////////////////////////////////////

///////////////////////////////////////////
// Begin Custom Forms
///////////////////////////////////////////
