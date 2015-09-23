console.log('Setup the Jquery testing code.');


// chrome.extension.sendMessage({}, function(response) {
// 	console.log('sendMessage baks')
// 	var readyStateCheckInterval = setInterval(function() {
// 	if (document.readyState === "complete") {
// 		clearInterval(readyStateCheckInterval);

// 		// ----------------------------------------------------------
// 		// This part of the script triggers when page is done loading
// 		console.log("Hello. This message was sent from scripts/inject.js");
// 		// ----------------------------------------------------------

// 	}
// 	}, 10);
// });


/*
This method has to have this particular signature (3 params) and it will be executed
every time the content script receives a call (a request)
*/

function ListeningMethod(request, sender, callback){
  console.log('Listen', request, sender);

  if (request.action == 'ExecuteTest') {
 	var test = request.test;

    if (test.action && test.action == 'redirect') {
       callback({ status: true, action: test.action });
       return document.location = test.value;
       // TODO: Need to check the URL changed.
       //return callback({ status: true, action: test.action });
    }

    var target = null;
    console.log('Current Test', test, target);

    if (test.target.substring(0, 1) == '$') {
      console.log('Getting target using Eval().')
      target = eval(test.target);
    } else {
      console.log('Getting target with string for $().');
      target = $(test.target)
    }

    var status = false;
    var message = 'No message set.';

    /* This action will check to see if we found a value. */
    if (test.action && test.action == 'found') {
       status  = target.length > 0;
       var message = status ? 'Target Found' : 'Target not found';
       return callback({ status: target.length > 0, message: message, action: test.action, target: target });
    }

    if (test.value) {
       target.val(test.value);
    
       status = target.val() == test.value;
       message = status ? 'Value was set to ' + test.value : 'Value was not set as expected.';
    }

    if (test.action && test.action == 'click') {
       target.click();
       status = true;
       message = 'Performed click() on target';
    }

    if (test.action && test.action == 'submit') {
       status = true;

       target.submit();
    }

    console.log('End of Test: ' + test.name);
    callback({ status: status, message: message, action: test.action, target: target });
  }
}
 
/*
Here we are asking the content scripts to listen to the phone calls (requests) and
to call the method named ListeningMethod when it actually listens the ring
*/

chrome.extension.onRequest.addListener(ListeningMethod);