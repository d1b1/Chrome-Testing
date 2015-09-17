console.log('getting ready for testing');

$(function() {
    $( "#sortable" ).sortable({
      revert: true,
      axis: "y",
      handle: "span",
      helper: "clone",
      placeholder: "ui-state-highlight"
    });
    $( "tr" ).disableSelection();

    function ExecuteTestInBrowser(id) {

      console.log('asdfasdfasdf')
      /*
         The following line of code will give us information about the tab currently selected
         in the browser window.  For example tab.id will give us the id of the selected tab.
      */

      // chrome.tabs.getSelected(null, function(tab) {

        /*
          The following line of code will send what is called a request to the content
          scripts(B) that you have added to the original pages.  It's like making a phone
          call but in order for someone to here the ring on the other end, there must be a
          'listener' as you will see later
        */

        var currentSchema = $('#currentSchema').val() || 'heroku_login';
        var runSpeed = $('#runSpeed').val() || 500;

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
 
        var tests = schemas[currentSchema];

        if (id == 0) {

          var i = 1;
          var totalRun = 0;
          $('#finalMessage').addClass('hide').html('');
          $('.glyphicon-ok').addClass('hide');

          var q = async.queue(function (test, callback) {
              setTimeout(function() { 
                console.log('ssss', test.action, test.value)

                chrome.runtime.sendMessage({ 'action': 'sendToConsole', 'test': test }, 
                                    function() {
                                      $('[data-id="' + i + '"]').removeClass('hide')
                                      i++; totalRun++;
                                      console.log('got here')
                                      callback();
                                    });

                // if (test.action == 'redirect') {
                //   chrome.tabs.executeScript(null, { code: "document.location='" + test.value + "'"}, callback);
                
                // } else {
                //   chrome.tabs.sendRequest(tab.id, { 'action': 'ExecuteTest', 'test': test }, 
                //     function() {
                //       $('[data-id="' + i + '"]').removeClass('hide')
                //       i++; totalRun++;
                //       callback();
                //     });
                // }
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

      //});
    }

    $('.runTestAll').on('click', function(e) {
      ExecuteTestInBrowser(0);
    });

    $('.runTest').on('click', function(e) {
      var id = $(e.currentTarget).data('id');

      ExecuteTestInBrowser(id);
    })
  });

// chrome.tabs.executeScript(null, { code: "$('#lst-ib').val('here we are');"});
// chrome.tabs.executeScript(null, { code: "runTest();" }, callback );


