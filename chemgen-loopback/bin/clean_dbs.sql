use chemgen_wp_stage;
DELETE FROM wp_posts where ID >= 258;
DELETE FROM wp_postmeta where post_id >= 258;
DELETE FROM wp_term_relationships where object_id >= 258;

use wordpress;
