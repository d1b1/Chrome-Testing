console.log('Setup the Jquery testing code.');


chrome.extension.sendMessage({}, function(response) {
	console.log('sendMessage baks')
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

	}
	}, 10);
});


/*
This method has to have this particular signature (3 params) and it will be executed
every time the content script receives a call (a request)
*/

function ListeningMethod(request, sender, callback){
  if (request.action == 'ExecuteTest') {
 	var test = request.test;

    if (test.action && test.action == 'redirect') {
       document.location = test.value;
       return callback('callbackData');
    }

    if (test.value) {
       $(test.target).val(test.value)
    }

    if (test.action && test.action == 'click') {
       $(test.target).click();
    }

    if (test.action && test.action == 'submit') {
       $(test.target).submit();
    }

    callback('callbackData');
  }

}
 
/*
Here we are asking the content scripts to listen to the phone calls (requests) and
to call the method named ListeningMethod when it actually listens the ring
*/

chrome.extension.onRequest.addListener(ListeningMethod);