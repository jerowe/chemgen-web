<?php
// wp-content/themes/Divi-child/functions-login.php

if (current_user_can('manage_options')) {
    add_action('admin_notices', 'display_user_token');
}

function display_user_token() {
    $user_id = get_current_user_id();
    $auth_token = get_user_meta( $user_id, 'wordpress_access_token', true);
    //setcookie('wordpress_user_id', $user_id, time() + 3600, '/', "onyx.abudhabi.nyu.edu/wordpress");
    //setcookie('wordpress_access_token', $auth_token, time() + 3600, '/', 'onyx.abudhabi.nyu.edu/wordpress');
    echo $auth_token;
}

add_filter( 'login_redirect', 'ab_login_redirect', 10, 3 );
function ab_login_redirect( $redirect_to, $request, $user ) {
    return site_url() . '/login';
}

add_action ( 'login_form_logout' , 'ab_cookie_remove_logout' );
function ab_cookie_remove_logout() {
    //setcookie('wordpress_access_token', "expired", time() - 3600, '/', preg_replace('#^http?://#', '', rtrim(site_url(),'/')), 0);

    unset( $_COOKIE['wordpress_access_token']  );
    unset( $_COOKIE['wordpress_user_id']  );

    wp_logout();
}

?>
