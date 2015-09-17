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

    var options = JSON.parse(localStorage.getItem('tests'));

    $('.addSuiteButton').on('click', function(e) {
      $('#finalMessage').removeClass('hide').html('Show a form to add a suite.')
    });

  });

    // create the module and name it scotchApp
    var scotchApp = angular.module('myApp', []);

    var schemas = [
      { name: 'heroku_login', steps: [
          { name: 'Goto Heroku URL for Login', target: '#lst-ib', value: 'https://id.heroku.com/login', action: 'redirect' },
          { name: 'Set the Email', target: '#email', value: 'stephan.smith.bc93@gmail.com' },
          { name: 'Set the Password', target: '#password', value: '22222' },
          { name: 'Submit the Login Form', target: '.btn-primary', value: null, action: 'click' }
        ],
      },
      { name: 'google_search', steps: [
          { name: 'Go to Google.com', target: '#lst-ib', value: 'http://google.com', action: 'redirect' },
          { name: 'Set Q=1111', target: '#lst-ib', value: '11111' },
          { name: 'Set Q=2222', target: '#lst-ib', value: '22222' },
          { name: 'Set Q=All Done', target: '#lst-ib', value: 'All Done' },
          { name: 'Set Q=3333', target: '#lst-ib', value: '33333' },
          { name: 'Submit the Form', target: 'form.tsf', action: 'submit' }
        ],
      },
      { name: 'google_urls', steps: [
          { name: 'Goto google.com', target: '#lst-ib', value: 'https://www.google.com', action: 'redirect' },
          { name: 'Goto google with a search value', target: '#lst-ib', value: 'https://www.google.com/?gws_rd=ssl#q=one', action: 'redirect' },
          { name: 'Goto google with a second value', target: '#lst-ib', value: 'https://www.google.com/?gws_rd=ssl#q=two', action: 'redirect' }
        ]
      }
    ];

    // localStorage.setItem('tests', JSON.stringify(schemas));

    var currentTest = localStorage.getItem('currentTest');
    if (!currentTest) {
      localStorage.setItem('currentTest', _.first(schemas).name);
      currentTest = localStorage.getItem('currentTest');
    }

    scotchApp.controller('mainController', function($scope) {

        $scope.services = [];
        var options = JSON.parse(localStorage.getItem('tests'));
        if (options) {
          $scope.services = options;
        }

        $scope.activeTest = _.findWhere($scope.services, { name: currentTest});

        $scope.reloadSampleTests = function() {
          localStorage.setItem('tests', JSON.stringify(schemas));
          $scope.services = schemas;

          $scope.activeTest = schemas[_.first(_.keys(schemas))];
          currentTest = $scope.activeTest.name;
          localStorage.setItem('currentTest', currentTest);
        }

        $scope.changeCurrentTest = function() {
          localStorage.setItem('currentTest', $scope.activeTest.name);
        }

        $scope.runIndividualTest = function(testIdx) {
          ExecuteTestInBrowser(testIdx, $scope.activeTest);
        }

        $scope.runAllTest = function() {
          console.log('activeTest', $scope.activeTest);
          ExecuteTestInBrowser(-1, $scope.activeTest);
        }

        $scope.removeTestButton = function() {
          $scope.services = _.reject($scope.services, function(service) {
            return service.name == $scope.activeTest.name;
          });

          $scope.activeTest = $scope.services[_.first(_.keys($scope.services))];
          localStorage.setItem('tests', JSON.stringify($scope.services));
        }

        $scope.addTestButton = function() {
          $('#newTestForm').removeClass('hide');
        }

        $scope.editTestStep = function(idx) {
          console.log('ssssss', idx);
          $scope.editModeIdx = idx;
        }

        $scope.newTest = { name: '', steps: [] };

        $scope.createTest = function() {
          $scope.services.push($scope.newTest);
          localStorage.setItem('tests', JSON.stringify($scope.services));

          $scope.activeTest = $scope.newTest;
          currentTest = $scope.activeTest.name;
          localStorage.setItem('currentTest', currentTest);

          $('#newTestForm').addClass('hide');
        }

        $scope.newTestStep = JSON.stringify({ name: 'New Step', target: '', action: '', value: '' });
        $scope.createTestStep = function() {
          $scope.activeTest.steps.push(JSON.parse($scope.newTestStep))
        }

        $scope.deleteTestStep = function(idx) {
          $scope.activeTest.steps.splice(idx, 1);
        }

        // create a message to display in our view
        $scope.message = 'Everyone come and see how good I look!';
    });

    scotchApp.filter('titleCase', function() {
      return function(input) {
        input = input || '';
        return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      };
    });

    scotchApp.filter('clean', function(){
      return function(text) {
           return text ? text.replace(/\_/g, ' ') : '';
      };
    });

    function ExecuteTestInBrowser(idx, testObj) {
      chrome.tabs.getSelected(null, function(tab) {
        var steps = testObj.steps[idx];
        var runSpeed = $('#runSpeed').val() || 500;

        if (idx == -1) {
          var totalRun = 0;
          $('#finalMessage').addClass('hide').html('');
          $('.glyphicon-ok').addClass('hide');

          var q = async.queue(function (test, callback) {
              setTimeout(function() { 
                if (test.action && test.action == 'redirect') {
                  chrome.tabs.executeScript(null, { code: "document.location='" + test.value + "'"}, callback);
                } else {
                  chrome.tabs.sendRequest(tab.id, { 'action': 'ExecuteTest', 'test': test }, 
                    function() {
                      $('[data-id="' + totalRun + '"]').removeClass('hide')
                      totalRun++;
                      callback();
                    });
                }
              }, runSpeed);
          }, 1);

          q.drain = function() {
            $('#finalMessage').removeClass('hide').html('All Done. No Errors. Ran ' + totalRun + ' assertions.')
          }

          q.push(testObj.steps, function(err) {});
        } else {
          chrome.tabs.sendRequest(tab.id, { 'action': 'ExecuteTest', 'test': testObj.steps[idx] }, 
            function(data) {
              console.log('Assertion Result', data);
            });
        }
      });
    }


