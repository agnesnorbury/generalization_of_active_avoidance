/**
 * jspsych-survey-likert
 * a jspsych plugin for measuring items on a likert scale
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['survey-likert'] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // default parameters for the trial
    trial.preamble = typeof trial.preamble === 'undefined' ? "" : trial.preamble;
    trial.force_response = trial.force_response || true;
    trial.reminder_alert = trial.reminder_alert || 'Please answer all items.';

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show preamble text
    display_element.append($('<div>', {
      "id": 'jspsych-survey-likert-preamble',
      "class": 'jspsych-survey-likert-preamble'
    }));

    $('#jspsych-survey-likert-preamble').html(trial.preamble);

    display_element.append('<form id="jspsych-survey-likert-form">');
    // add likert scale questions
    for (var i = 0; i < trial.questions.length; i++) {
      form_element = $('#jspsych-survey-likert-form');
      // add question
      form_element.append('<label class="jspsych-survey-likert-statement">' + trial.questions[i] + '</label>');
      // add options
      var width = 100 / trial.labels[i].length;
      options_string = '<ul class="jspsych-survey-likert-opts" data-radio-group="Q' + i + '">';
      for (var j = 0; j < trial.labels[i].length; j++) {
        options_string += '<li style="width:' + width + '%"><input type="radio" name="Q' + i + '" value="' + j + '"><label class="jspsych-survey-likert-opt-label">' + trial.labels[i][j] + '</label></li>';
      }
      options_string += '</ul>';
      form_element.append(options_string);
    }

    var isResponseComplete = function(response_data){
      var keys=Object.keys(response_data);
      var resp=true;
      for(i=0;i<keys.length;i++){
        if(response_data[keys[i]]==-1){
          var resp = false;
          $('.jspsych-survey-likert-statement').eq(i).css({'background-color':'rgba(230,0,0,0.6)'});
        }else{
          $('.jspsych-survey-likert-statement').eq(i).css({'background-color':''});
        };
      };
      return resp;
    };

    // add submit button
    display_element.append($('<button>', {
      'id': 'jspsych-survey-likert-next',
      'class': 'jspsych-survey-likert jspsych-btn'
    }));
    $("#jspsych-survey-likert-next").html('Submit Answers');
    $("#jspsych-survey-likert-next").click(function() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      $("#jspsych-survey-likert-form .jspsych-survey-likert-opts").each(function(index) {
        var id = $(this).data('radio-group');
        var response = $('input[name="' + id + '"]:checked').val();
        if (typeof response == 'undefined') {
          response = -1;
        }
        var obje = {};
        obje[id] = response;
        $.extend(question_data, obje);
      });

      // save data
      var trial_data = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };


      // check if forced response set true
      if(trial.force_response){
        // if forced response set to true, continue only if response complete
          if (isResponseComplete(question_data)){
            display_element.html('');
            jsPsych.finishTrial(trial_data);
          }else{
            alert(trial.reminder_alert);
          };
      }else{
        // if no forced response, next trial
        display_element.html('');
        jsPsych.finishTrial(trial_data);
      };
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();