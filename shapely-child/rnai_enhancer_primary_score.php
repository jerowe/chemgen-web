<?php
/*
Template Name: RNAi Enh Primary Scoring
Template Post Type: post, page
*/
get_header();
add_filter( 'the_content', 'my_the_content_filter', 20 );
function my_the_content_filter( $content ) {

    if ( is_single() )
        // Add image to the beginning of each page
        $new_content = '<div class="row">
    <div class="container">
      <form role="form" class="form-horizontal">
        <!-- Begin row -->
          <div class="form-group">
            <label class="control-label col-xs-3" for="mutant_rnai">Mutant + RNAi</label>
            <label class="checkbox-inline"><input type="checkbox"  value="">No Sup/Enh</label>
          </div>
          <div class="form-group">
            <label class="control-label col-xs-3" for="embryonic_ster">Weak</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Emb</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Ste</label>
          </div>
        <!-- End row -->
        <!-- Begin row -->
          <div class=" form-group">
            <label class="control-label col-xs-3" for="embryonic_ster">Medium</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Emb</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Ste</label>
          </div>
          <div class=" form-group">
            <label  class="control-label col-xs-3" for="embryonic_ster">Strong</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Emb</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Ste</label>
          </div>
          <div class="form-group">
            <label   class="control-label col-xs-3" for="description">Description</label>
            <label class="checkbox-inline"><input type="checkbox" value="">UF</label>
            <label class="checkbox-inline"><input type="checkbox" value="">NB</label>
            <label class="checkbox-inline"><input type="checkbox" value="">NW</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Cont</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Problem</label>
          </div>
          <div class=" form-group">
            <label   class="control-label col-xs-3" for="pe_lva">PE/LVA</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Supp</label>
            <label class="checkbox-inline"><input type="checkbox" value="">Enh</label>
          </div>
            <div class="form-group">
              <label   class="control-label col-xs-3" for="n2_rnai">N2 + RNAi</label>
              <label class="checkbox-inline"><input type="checkbox" value="">WT</label>
              <label class="checkbox-inline"><input type="checkbox" value="">Ste</label>
              <label class="checkbox-inline"><input type="checkbox" value="">LB</label>
              <label class="checkbox-inline"><input type="checkbox" value="">LVA</label>
              <label class="checkbox-inline"><input type="checkbox" value="">PE</label>
            </div>
            <div class="form-group">
              <label class="control-label col-xs-3" for="n2_rnai">N2 + RNAi</label>
              <label class="checkbox-inline"><input type="checkbox" value="">UF</label>
              <label class="checkbox-inline"><input type="checkbox" value="">NB</label>
              <label class="checkbox-inline"><input type="checkbox" value="">NW</label>
              <label class="checkbox-inline"><input type="checkbox" value="">Cont</label>
              <label class="checkbox-inline"><input type="checkbox" value="">Problem</label>
            </div>
        <div class="form-group">
          <div class="col-sm-6">
            <button type="submit" class="btn btn-info">Submit</button>
          </div>
        </div>
      </form>
    </div> <!-- #container 2nd Col -->';

    // Returns the content.
    return $content . $new_content;
}
?>

<?php $layout_class = (function_exists('shapely_get_layout_class')) ? shapely_get_layout_class() : ''; ?>
<div class="row">
  <div id="primary" class="col-md-12 mb-sm-24 <?php echo esc_attr($layout_class); ?>">

      <?php
			while ( have_posts() ) : the_post();
        ?>
        <input type="hidden" id="activepost" name="activepost" value="<?php echo get_the_ID() ?>">
        <?php
				get_template_part( 'template-parts/content' );

        ?>

    <?php
				// If comments are open or we have at least one comment, load up the comment template.
				if ( comments_open() || get_comments_number() ) :
					comments_template();
				endif;

			endwhile; // End of the loop.
			?>
    </div> <!-- .container 1st Col -->

  </div><!-- #primary -->
</div><!-- .row -->

<?php
get_footer();
