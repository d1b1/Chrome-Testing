// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	
  	chrome.tabs.getSelected(null, function(tab) {

  		chrome.tabs.sendRequest(tab.id, { 'action': 'ExecuteTest', 'test': 'sss' }, 
	        function() {
	          console.log('Got Here and done');
	        });

  	})

  });

chrome.extension.onRequest.addListener(function(request) {
	console.log('sssasdfasdfasdfasdfasdfasdfasdfheree')
	
  if (request.command !== 'sendToConsole')
    return;
  chrome.tabs.executeScript(request.tabId, {
      code: "("+ tab_log + ")('" + request.args + "');",
  });
});
