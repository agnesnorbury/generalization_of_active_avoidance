/*
 * jspsych-rating.js 
 * AN
 * (derived from jspsych-similarity.js, Josh de Leeuw)
 *
 * This plugin create a trial where one image is shown, and the subject rates it on a VAS scale using a slider controlled with the mouse.
 *
 *
 */


jsPsych.plugins.rating= (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('similarity', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'rating',
    description: '',
    parameters: {
      stimulus: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        array: true,
        no_function: false,
        description: ''
      },
      is_html: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      labels: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: ['0%', '100%'],
        no_function: false,
        description: ''
      },
      intervals: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 100,
        no_function: false,
        description: ''
      },
      show_ticks: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      show_response: {
        type: [jsPsych.plugins.parameterType.SELECT],
        options: ['FIRST_STIMULUS', 'SECOND_STIMULUS','POST_STIMULUS'],
        default: 'FIRST_STIMULUS',
        no_function: false,
        description: ''
      },
      timing_first_stim: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.labels = (typeof trial.labels === 'undefined') ? ["0", "100"] : trial.labels;
    trial.intervals = trial.intervals || 100;
    trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;

    trial.show_response == "FIRST_STIMULUS";
    trial.timing_first_stim = trial.timing_first_stim || -1; // default 1000ms

    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show the image
    if (!trial.is_html) {
      display_element.append($('<img>', {
        "src": trial.stimulus,
        "id": 'jspsych-sim-stim'
      }));
    } else {
      display_element.append($('<div>', {
        "html": trial.stimulus,
        "id": 'jspsych-sim-stim'
      }));
    }
    
    //$('#jspsych-sim-stim').css('visibility', 'visible');

    if (trial.show_response == "FIRST_STIMULUS") {
      show_response_slider(display_element, trial);
    }


    function show_response_slider(display_element, trial) {

      var startTime = (new Date()).getTime();

      // create slider
      display_element.append($('<div>', {
        "id": 'slider',
        "class": 'sim'
      }));

      $("#slider").slider({
        value: Math.ceil(trial.intervals / 2),
        min: 1,
        max: trial.intervals,
        step: 1,
      });

      // show tick marks
      if (trial.show_ticks) {
        for (var j = 1; j < trial.intervals - 1; j++) {
          $('#slider').append('<div class="slidertickmark"></div>');
        }

        $('#slider .slidertickmark').each(function(index) {
          var left = (index + 1) * (100 / (trial.intervals - 1));
          $(this).css({
            'position': 'absolute',
            'left': left + '%',
            'width': '1px',
            'height': '100%',
            'background-color': '#222222'
          });
        });
      }

      // create labels for slider
      display_element.append($('<ul>', {
        "id": "sliderlabels",
        "class": 'sliderlabels',
        "css": {
          "width": "100%",
          "height": "3em",
          "margin": "0px 0px 0px 10px",
          "padding": "0px",
          "display": "block",
          "position": "relative"
        }
      }));

      for (var j = 0; j < trial.labels.length; j++) {
        $("#sliderlabels").append('<li>' + trial.labels[j] + '</li>');
      }

      // position labels to match slider intervals
      var slider_width = $("#slider").width();
      var num_items = trial.labels.length;
      var item_width = slider_width / num_items;
      var spacing_interval = slider_width / (num_items - 1);

      $("#sliderlabels li").each(function(index) {
        $(this).css({
          'display': 'inline-block',
          'width': item_width + 'px',
          'margin': '0px',
          'padding': '0px',
          'text-align': 'center',
          'position': 'absolute',
          'left': (spacing_interval * index) - (item_width / 2)
        });
      });

      //  create button
      display_element.append($('<button>', {
        'id': 'next',
        'class': 'sim',
        'html': 'Submit Answer'
      }));

      // if prompt is set, show prompt
      if (trial.prompt !== "") {
        display_element.append(trial.prompt);
      }

      $("#next").click(function() {
        var endTime = (new Date()).getTime();
        var response_time = endTime - startTime;

        // kill any remaining setTimeout handlers
        //jsPsych.pluginAPI.clearAllTimeouts();

        var score = $("#slider").slider("value");
        var trial_data = {
          "score": score,
          "rt": response_time,
          "stimulus": JSON.stringify([trial.stimulus])
        };
        // goto next trial in block
        display_element.html('');
        jsPsych.finishTrial(trial_data);
      });
    }
  };
  return plugin;
})();
