/*
  The background script only runs once when the extension is installed.

  Here I set up an event listner to check when a web navigation is made to one of the URL's
  specified in the 'filter' object below.

  The .onComitted method passes a details object to the callback function that includes
  information about the navigation. If the details object reveals that the webnav happened
  because of a reload, that navigation wont be counted as a search in the extension.
*/


//Filter for chrome.webNavigation.onCompleted.addListener
const filter = {
  url: [{
      urlContains: "google.com/search"
    },
    {
      urlContains: "yahoo.com/search"
    },
    {
      urlContains: "duckduckgo.com/?q"
    },
    {
      urlContains: "bing.com/search"
    },
    {
      urlContains: "baidu.com/s?"
    }
  ]
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
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
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
