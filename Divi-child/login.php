<?php
// wp-content/themes/Divi-child/login.php

/*
Template Name: Login Page
*/

$client_secret = "N8PxcchTEvOd8g0DdoZ4SiYdIFPadf";
$client_id = "ImK4mJHreUzCsMvXnmQujUlpGBsyqt";

$code = false;
if(isset($_GET['code'])) {
    $code = $_GET['code'];
}

// If there is no code present, first get the code by redirecting to login page
if(!$code) {

    $url = site_url() . '/login/?oauth=authorize&response_type=code&client_id=' . $client_id;
    header('Location: ' . $url);
    die();

} else {

    // Encode the client ID and secret with base64 in
    // order to add it to the Authorization header
    $auth = base64_encode($client_id.':'.$client_secret);
    try {

        // Making the Call to get the access token
        $args = [
            'headers' => [
                'Authorization' => 'Basic ' . $auth
            ],
            'body' => [
                'grant_type'    => 'authorization_code',
                'code'          => $code
            ],
    ];

        // Send the actual HTTP POST with the built-in WordPress HTTP library.
        $json = wp_remote_post( site_url() . '/login/?oauth=token', $args );

        if(is_array($json) && isset($json['body'])) {

            $json = json_decode($json['body']);

            // Retrieve the access token from the response
            $auth_token = $json->access_token;
            $user_id = get_current_user_id();

            //print_r($json);
            //print_r($auth_token);

            // Set the cookie
            //setcookie('wordpress_access_token', $auth_token, time() + 3600);
            //setcookie('wordpress_user_id', $user_id, time() + 3600, '/', "onyx.abudhabi.nyu.edu/wordpress");
            //setcookie('wordpress_access_token', $auth_token, time() + 3600, '/', 'onyx.abudhabi.nyu.edu/wordpress');

            //wp_localize_script( 'wp-api', 'wpApiSettings', array( 'root' => esc_url_raw( rest_url()  ), 'nonce' => wp_create_nonce( 'wp_rest'  )  )  );

            $nonce = wp_create_nonce('wp_rest');

            $secure = ( 'https' === parse_url( wp_login_url(), PHP_URL_SCHEME ) );
            setcookie('wordpress_access_token', $auth_token, 0, COOKIEPATH, COOKIE_DOMAIN, $secure);
            setcookie('wordpress_user_id', $user_id, 0, COOKIEPATH, COOKIE_DOMAIN, $secure);
            setcookie('wordpress_nonce', $nonce, 0, COOKIEPATH, COOKIE_DOMAIN, $secure);

            if( SITECOOKIEPATH != COOKIEPATH ){
                setcookie('wordpress_access_token', $auth_token, 0, SITECOOKIEPATH, COOKIE_DOMAIN, $secure);
                setcookie('wordpress_user_id', $user_id, 0, SITECOOKIEPATH, COOKIE_DOMAIN, $secure);
                setcookie('wordpress_nonce', $nonce, 0, SITECOOKIEPATH, COOKIE_DOMAIN, $secure);
            }

            // Save the cookie to user meta
            // Can be useful for debugging or if needed to refresh the cookie
            update_user_meta($user_id, 'wordpress_access_token', $auth_token);
        } else {
            print_r($json);
            die();
        }

        // All set, redirect to the home page
        header('Location: ' . site_url());
    } catch (Exception $e) {
        var_dump($e);
    }
}
