/*
Filter for chrome.webNavigation.onCompleted.addListener
only triggers on google searches
*/
const filter = {
  url: [{
    urlContains: "google.com/search?"
  }]
}

/*
This listenes for any web navigation that includes parameters defined in the filter
*/
chrome.webNavigation.onCommitted.addListener(sendMessageToContentScript, filter)

/*
Send a message from the extension to the content script

This message doesn't contain any information about the content of the web navigation
only includes the date and time of the search
*/
function sendMessageToContentScript(details) {
  //only run for typed or generated navigations. no reloads
  console.log(details.transitionType)
  if (details.transitionType != "reload") {
    var message = {
      timeStamp: details.timeStamp
    }
    //console.log(details.transitionType)
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, function(response) {

        if (chrome.runtime.lastError) {
          /*
            If a navigation happens in a new tab, the content script hasn't loaded yet
            and will throw a chrome runtime lastError. setTimeout to recall the method after 1s
          */
          console.log("Message not recieved")
          setTimeout(sendMessageToContentScript.bind(null, details), 3000)
        } else {
          console.log(response.status)
        }
      })
    })
  }
}

// ################# CODE DUMP ########################
// function navCompleted(details) {
//   var searches = {};
//   console.log(`onCompleted: ${details.url}`);
//   chrome.storage.sync.get(["searches"], function(data){data ? searches = data: null});
//
//   searches.test = "Back from the void " + details;
//
//   chrome.storage.sync.set({ "searches" : searches }, function() {
//     if (chrome.runtime.error) {
//       console.log("Runtime error.");
//     }
//   });
//
// }
