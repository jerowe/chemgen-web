<?php
/*
Template Name: Custom Assay Display
Template Post Type: post, page
*/
get_header();
$search = new WP_Advanced_Search('my-form');
?>

<?php $layout_class = (function_exists('shapely_get_layout_class')) ? shapely_get_layout_class() : ''; ?>
<div class="row">
	<div id="primary" class="col-md-12 mb-xs-24 <?php echo esc_attr($layout_class); ?>">

		<!-- TODO create scoring plugin with more general functions -->
		<!-- Custom Form for returning posts with various Identifiers -->
		<div class="container">
			<?php
			$search->the_form();
			$wp_query = $search->query();
			$temp = $wp_query;
			?>
			<div id="wpas-debug"></div>
		</div>

    <!-- Begin Custom Query Loop -->
    <div id="rnai_scoring_content">
        <?php
				rnai_loop_posts($wp_query);
        ?>

    </div><!-- #rnai_scoring_content -->
		<?php
		$wp_query = $temp;
		?>
</div><!-- #primary -->
</div>

<?php
get_footer();
die();
