<?php

function custom_pagination($numpages = '', $pagerange = '', $paged='')
{
    if (empty($pagerange)) {
        $pagerange = 2;
    }

    /**
    * This first part of our function is a fallback
    * for custom pagination inside a regular loop that
    * uses the global $paged and global $wp_query variables.
    *
    * It's good because we can now override default pagination
    * in our theme, and use this function in default quries
    * and custom queries.
    */
    global $paged;
    if (empty($paged)) {
        $paged = 1;
    }
    if ($numpages == '') {
        global $wp_query;
        $numpages = $wp_query->max_num_pages;
        if (!$numpages) {
            $numpages = 1;
        }
    }

    /**
    * We construct the pagination arguments to enter into our paginate_links
    * function.
    * Change this for ajax call
    */
    $pagination_args = array(
        'base'            => get_pagenum_link(1) . '%_%',
        'format'          => 'page/%#%',
        'total'           => $numpages,
        'current'         => $paged,
        'show_all'        => false,
        'end_size'        => 1,
        'mid_size'        => $pagerange,
        'prev_next'       => true,
        'prev_text'       => __('&laquo;'),
        'next_text'       => __('&raquo;'),
        'type'            => 'plain',
        'add_args'        => false,
        'add_fragment'    => ''
    );

    $paginate_links = paginate_links($pagination_args);

    if ($paginate_links) {
        echo "<div class='text-center'>";
        echo "<span class='page-numbers page-num'>Page " . $paged . " of " . $numpages . "</span> ";
        echo "<nav class='pagination'>";
        echo $paginate_links;
        echo "</nav>";
        echo "</div>";
    }
}

function rnai_loop_posts($custom_query){

  $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
  if ($custom_query->have_posts()) :

    while ($custom_query->have_posts()) : $custom_query->the_post();

    get_template_part('template-parts/content');

    // If comments are open or we have at least one comment, load up the comment template.
    if (comments_open() || get_comments_number()) :
      comments_template();
    endif;

  endwhile; // End of the loop.

  if (function_exists(custom_pagination)) {
    custom_pagination($custom_query->max_num_pages, "", $paged);
  }

  wp_reset_postdata();
else:
  //No posts
  _e('Sorry, no posts matched your criteria.');
endif;
}

//TODO Make this more general
//TODO figure out LIKE '%thing%'
function rnai_build_query($params)
{
  $query_args = array(
    'post_type' => 'assay',
    'posts_per_page' => 5,
  );
  $has_query = False;
  $tax_query = array();

  if(isset($params['wb_sequence_id'])){
    array_push($tax_query , array(
      'taxonomy' => 'wb_sequence_id',
      'field'    => 'name',
      'terms'    => $params['wb_sequence_id'],
    ));
    $has_query = True;
  }
  if(isset($params['condition'])){
    array_push($tax_query, array(
      'taxonomy' => 'condition',
      'field'    => 'name',
      'terms'    => $params['condition'],
    ));
    $has_query = True;
  }
  if(isset($params['screen_name'])){
    array_push($tax_query, array(
      'taxonomy' => 'screen_name',
      'field'    => 'name',
      'terms'    => $params['screen_name'],
    ));
    $has_query = True;
  }

  if($has_query){
    $tax_query['relation'] = 'AND';
    $query_args['tax_query'] = $tax_query;
  }

  $custom_query = new WP_Query( $query_args );
  return $custom_query;
}

?>
