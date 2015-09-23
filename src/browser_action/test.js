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
    $( "td" ).disableSelection();


  });

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

    var currentTest = null;
    var tests = [];
    var currentTab = null;

    chrome.storage.sync.get('currentTest', function(data) {
      // Check if we got data.
      if (!_.has(data,'currentTest')) {
        // Set the default.
        currentTest = _.first(schemas).name;

        // Save the default.
        chrome.storage.sync.set({'currentTest': currentTest}, function() {
          console.log('Setting default test name.');
        });
      } else {
        // Get the current test value.
        currentTest = data.currentTest;
      }

      console.log('CurrentTab', currentTab);
    });

    function setCurrentTest(name) {
      currentTest = name;
      chrome.storage.sync.set({'currentTest': currentTest}, function() {
        console.log('Setting the current test.');
      });
    }

    function setTests(tests) {
      chrome.storage.sync.set({'tests': JSON.stringify(tests) }, function() {
        console.log('Set the tests object.');
      });
    }

    function setTab(tab) {
      chrome.storage.sync.set({'currentTab': tab }, function() {
        console.log('Set the tests object tab.', tab);
      });
    }

    var scotchApp = angular.module('myApp', []);

    scotchApp.controller('mainController', function($scope, $timeout, Tests) {

        $scope.stepActions = [
          { title: 'Change Url', value: 'redirect' },
          { title: 'Single Click', value: 'click' },
          { title: 'Double Click', value: 'dblclick' },
          { title: 'Focus', value: 'focus' },
          { title: 'Blur', value: 'blur' },
          { title: 'Set to', value: 'val' },
          { title: 'Found', value: 'found' }
        ];

        $( "#sortable" ).sortable({
          revert: true,
          axis: "y",
          handle: "span",
          helper: "clone",
          placeholder: "ui-state-highlight"
        });
        $( "td" ).disableSelection();

        /* When we change the tab, we need to save the current hash. */
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
          setTab(e.target.hash);
        });

        chrome.storage.sync.get('currentTab', function(data) {
          if (!_.has(data,'currentTab')) {
            // Save the default.
            chrome.storage.sync.set({'currentTab': 'home'}, function() {
              console.log('Setting default test tab.');
              $('#tabs a[href="' + currentTab + '"]').tab('show');
            });
          } else {
            $('#tabs a[href="' + data.currentTab + '"]').tab('show');
          }
        });

        $scope.services = [];

        /* Call the service to get the tests. */
        Tests.get(function(data) {
          $scope.services = data;
          $scope.activeTest = _.findWhere($scope.services, { name: currentTest });
          $scope.$apply();
        });

        $scope.reloadSampleTests = function() {
          setTests(schemas);
          $scope.services = schemas;
          $scope.activeTest = schemas[_.first(_.keys(schemas))];
         
          setCurrentTest($scope.activeTest.name);
        }

        $scope.changeCurrentTest = function() {
          setCurrentTest($scope.activeTest.name);
        }

        /* This will run an individual test for a the current active test. */
        $scope.runIndividualTestStep = function(testIdx) {
          ExecuteTestInBrowser(testIdx, $scope.activeTest, function() {
            setTimeout(function() {
              $('.testStep').addClass('hide');
            }, 1500);
          });
        }

        /* This will run all the steps for the current active test. */
        $scope.runAllTestSteps = function() {
          ExecuteTestInBrowser(-1, $scope.activeTest, function() {
            setTimeout(function() {
              $('.testStep').addClass('hide');
            }, 1500);
          });
        }

        /* Runs all the existing tests in series. */
        $scope.runAllTestInSeries = function() {

          var q = async.queue(function (test, callback) {
              ExecuteTestInBrowser(-1, test, function() {
                callback();
              });
          }, 1);

          q.drain = function() {
            setTimeout(function() {
              $('.bulkTest').addClass('hide');
            }, 1500);
          }

          q.push($scope.services, function(err) {});
        }

        /* This will run all the steps in a specific test suite. */
        $scope.runIndividualTestSuite = function(testName) {
          var test = _.findWhere($scope.services, { name: testName });

          ExecuteTestInBrowser(-1, test, function() {
            setTimeout(function() {
              $('.bulkTest').addClass('hide');
            }, 1500);
          });
        }

        $scope.removeTestButton = function(testName) {
          $scope.services = _.reject($scope.services, function(service) {
            return service.name == testName;
          });

          $scope.activeTest = $scope.services[_.first(_.keys($scope.services))];
          setTests($scope.services);
        }

        $scope.addTestButton = function() {
          $('#newTestForm').removeClass('hide');
        }

        $scope.editTestStep = function(idx) {
          if ($scope.editModeIdx == idx) {
            $scope.editModeIdx = -1;
          } else {
            $scope.editModeIdx = idx;
          }
        }

        $scope.saveTestStepChanges = function() {
          $scope.editModeIdx = -1;
        }

        $scope.changeTestStepChanges = function(idx) {
          $scope.editModeIdx = -1;
        }

        $scope.newTest = { name: '', steps: [] };

        $scope.$watch('activeTest', function() {
            $scope.saveServices();
        }, true);

        $scope.createTest = function() {
          $scope.activeTest = newTest = _.clone($scope.newTest);
          $scope.services.push(newTest);

          setTests($scope.services);

          $scope.saveServices();

          setCurrentTest($scope.activeTest.name);

          $scope.newTest.name = '';
          $('#tabs a:first').tab('show')
        }

        $scope.createTestStep = function() {
          $scope.activeTest.steps.push({ name: '', target: '', action: '', value: '' });
          $scope.editModeIdx = $scope.activeTest.steps.length - 1;
          $scope.saveServices();
        }

        $scope.setActiveTest = function(testName) {
          $scope.activeTest = _.findWhere($scope.services, { name: testName });
          $scope.saveActiveTest();

          $('#tabs a:first').tab('show');
        }

        /* This will take the index of the current test and remove the step. */
        $scope.deleteStep = function(idx) {
          $scope.activeTest.steps.splice(idx, 1);
          $scope.saveServices();
        }

        /* This will delete the entire test Suite. */
        $scope.deleteTestSuite = function(testName) {
          var idx = _.findIndex($scope.services, function(service) { return service.name == testName; });
          $scope.services.splice(idx, 1);
          $scope.saveServices();
        }

        $scope.copyTestButton = function(testName) {
          var newTest = _.clone(_.findWhere($scope.services, { name: testName }));
          newTest.name = newTest.name + ' Copy';
          $scope.services.push(newTest);
          $scope.saveServices();
        }

        $scope.saveServices = function() {
          setTests($scope.services);
        }

        $scope.saveActiveTest = function() {
          setCurrentTest($scope.activeTest.name);
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

    scotchApp.factory('Tests', [function() {
      var tests = [];
      return {
        get: function(callback) {
          chrome.storage.sync.get('tests', function(data) {
            if (!_.has(data, 'tests')) {
              tests = [];
            } else {
              tests = JSON.parse(data.tests);
           }
           callback(tests);
         });
        }
      }
    }]);

    function ExecuteTestInBrowser(idx, testObj, cb) {
      chrome.tabs.getSelected(null, function(tab) {
        var steps = testObj.steps[idx];
        var runSpeed = 500;
        var errorCount = 0;

        if (idx == -1) {
          idx = 0;
          $('#finalMessage').addClass('hide').html('');
          $('.glyphicon-ok').addClass('hide');
          $('[data-test-name="' + testObj.name + '"] .glyphicon-refresh-animate').removeClass('hide');
          $('tr[data-test-name="' + testObj.name + '"]').removeClass('success');

          var q = async.queue(function (step, callback) {
              setTimeout(function() { 
                chrome.tabs.sendRequest(tab.id, { 'action': 'ExecuteTest', 'test': step }, 
                  function(data) {
                    console.log(step.name, 'Result from Series Step', data);

                    if (data) {
                      if (data.status) {
                        $('[data-id="' + idx + '"].testStep').removeClass('hide').addClass('iconRed');
                        $('[data-test-step-index="' + idx + '"].testStep').removeClass('hide').addClass('iconGreen');
                      } else {
                        console.log('sss', $('[data-id="' + idx + '"].testStep'));
                        $('[data-id="' + idx + '"].testStep').removeClass('hide').addClass('iconRed');
                        $('[data-test-step-index="' + idx + '"].testStep').removeClass('hide').addClass('iconRed');
                        errorCount++;
                      }
                    } else {
                      // Make this gray because we do not know. 
                      $('[data-id="' + idx + '"].testStep').removeClass('hide').addClass('iconGray');
                      $('[data-test-step-index="' + idx + '"].testStep').removeClass('hide').addClass('iconGreen');
                    }

                    idx++;
                    callback();
                  });
              }, runSpeed);
          }, 1);

          q.drain = function() {
            $('.finalMessage').removeClass('hide').html('All Done. No Errors. Ran ' + idx + ' assertions.')

            /* Set the test status icon. */
            if (errorCount == 0) {
              $('span[data-test-name="' + testObj.name + '"]').removeClass('hide').addClass('iconGreen');
            } else {
              $('span[data-test-name="' + testObj.name + '"]').removeClass('hide').addClass('iconRed');
            }

            /* Hide the Test Spinner icon. */
            $('[data-test-name="' + testObj.name + '"] .glyphicon-refresh-animate').addClass('hide');
            if (cb) cb();
          }

          q.push(testObj.steps, function(err) {});
        } else {
          chrome.tabs.sendRequest(tab.id, { 'action': 'ExecuteTest', 'test': testObj.steps[idx] }, 
            function(data) {
              console.log('Result', data);

              if (data) {
                if (data.status) {
                  $('.finalMessage').removeClass('hide').removeClass('alert-danger').addClass('alert-success').html('Passed. ' + data.message);
                  $('[data-test-step-index="' + idx + '"].testStep').removeClass('hide').addClass('iconGreen');
                } else {
                  $('.finalMessage').removeClass('hide').addClass('alert-danger').removeClass('alert-success').html('Failed. ' + data.message);
                  $('[data-test-step-index="' + idx + '"].testStep').removeClass('hide').addClass('iconRed');
                }
              } else {
                $('[data-test-step-index="' + idx + '"].testStep').removeClass('hide').addClass('iconGray');
              }
              
              if (cb) cb();
            });
        }
      });
    }


