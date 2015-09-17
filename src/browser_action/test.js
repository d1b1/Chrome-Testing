function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function ProperCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

$(function() {
    $( "#sortable" ).sortable({
      revert: true,
      axis: "y",
      handle: "span",
      helper: "clone",
      placeholder: "ui-state-highlight"
    });
    $( "tr" ).disableSelection();

    var schemas = {
      heroku_login: [
        { target: '#lst-ib', value: 'https://id.heroku.com/login', action: 'redirect' },
        { target: '#email', value: 'stephan.smith.bc93@gmail.com' },
        { target: '#password', value: '22222' },
        { target: '.btn-primary', value: null, action: 'click' }
      ],
      google_search: [
        { target: '#lst-ib', value: 'http://google.com', action: 'redirect' },
        { target: '#lst-ib', value: '11111' },
        { target: '#lst-ib', value: '22222' },
        { target: '#lst-ib', value: 'All Done' },
        { target: '#lst-ib', value: '33333' },
        { target: 'form.tsf', action: 'submit' }
      ],
      google_urls: [
        { target: '#lst-ib', value: 'https://www.google.com', action: 'redirect' },
        { target: '#lst-ib', value: 'https://www.google.com/?gws_rd=ssl#q=one', action: 'redirect' },
        { target: '#lst-ib', value: 'https://www.google.com/?gws_rd=ssl#q=two', action: 'redirect' }
      ]
    };

    // localStorage.setItem('tests',  JSON.stringify(schemas));

    var options = JSON.parse(localStorage.getItem('tests'));
    if (options) {
      _.each(_.keys(schemas), function(k) {
        $('#currentSchema').append($("<option></option>").attr("value", k).text( ProperCase(replaceAll( '_', ' ', k))));
      })
    } else {
      localStorage.setItem('tests',  JSON.stringify(schemas));
    }

    function ExecuteTestInBrowser(id) {
      chrome.tabs.getSelected(null, function(tab) {
        var currentSchema = $('#currentSchema').val() || 'heroku_login';
        var runSpeed = $('#runSpeed').val() || 500;
 
        var tests = schemas[currentSchema];

        if (id == 0) {

          var i = 1;
          var totalRun = 0;
          $('#finalMessage').addClass('hide').html('');
          $('.glyphicon-ok').addClass('hide');

          var q = async.queue(function (test, callback) {
              setTimeout(function() { 
                if (test.action == 'redirect') {
                  chrome.tabs.executeScript(null, { code: "document.location='" + test.value + "'"}, callback);
                
                } else {
                  chrome.tabs.sendRequest(tab.id, { 'action': 'ExecuteTest', 'test': test }, 
                    function() {
                      $('[data-id="' + i + '"]').removeClass('hide')
                      i++; totalRun++;
                      callback();
                    });
                }
              }, runSpeed);
          }, 1);

          q.drain = function() {
            $('#finalMessage').removeClass('hide').html('All Done. No Errors. Ran ' + totalRun + ' assertions.')
          }

          q.push(tests, function (err) {
            // TODO: Add in a log. Maybe to the main page console to help with debug.
          });

        } else {
          var test = tests[id-1]
          chrome.tabs.sendRequest(tab.id, { 'action': 'ExecuteTest', 'test': test }, 
            function(data) {
              console.log('Add done', data);
            });
        }

      });
    }

    $('.runTestAll').on('click', function(e) {
      ExecuteTestInBrowser(0);
    });

    $('.runTest').on('click', function(e) {
      ExecuteTestInBrowser($(e.currentTarget).data('id'));
    });

    $('.addSuiteButton').on('click', function(e) {
      $('#finalMessage').removeClass('hide').html('Show a form to add a suite.')
    });
  });

