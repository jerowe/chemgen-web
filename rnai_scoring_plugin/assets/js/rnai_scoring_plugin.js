jQuery(document).ready(function($) {

    // function process_rnai_lookup_form() {
    //
    //     var form = $('#rnai_lookup_form').serialize();
    //     var wb_sequence_id = $('#wb_sequence_id').val();
    //     var screen_name = $('#screen_name').val();
    //     var condition = $('#condition').val();
    //
    //     $.ajax({
    //         url: rnai_scoring.ajax_url,
    //         type: 'get',
    //         data: {
    //             action: 'rnai_scoring_ajax_action',
    //             wb_sequence_id: wb_sequence_id,
    //             condition: condition,
    //             screen_name: screen_name,
    //             // query_vars: 'rnai_scoring_ajax_action.query_vars',
    //             // page: page,
    //         },
    //         beforeSend: function() {
    //             $('#rnai_scoring_content').empty();
    //             $(document).scrollTop();
    //             $('#rnai_scoring_content').append('<div class="page-content" id="loader">Loading New Posts...</div>');
    //         },
    //         success: function(response) {
    //             console.log('success!');
    //             $('#rnai_scoring_content').empty();
    //             $('#rnai_scoring_content').append(response).page();
    //         },
    //         failure: function(response) {
    //             alert('failure ' + JSON.stringify(response));
    //         }
    //     });
    //
    //     return false;
    // }
    //
    // $("#rnai_lookup_form").submit(function(event) {
    //     process_rnai_lookup_form();
    //     return false;
    // });

});
