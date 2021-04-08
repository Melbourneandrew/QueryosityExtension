/*
Content script runs as soon as content is loaded in a tab
*/
console.log("Content Script Loaded.")
/*
Recieve a message from the background script every time google is queried with a search

Message consists soley of the timeStamp of the search
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log("Bacground recieved timestamp: " + request.timeStamp)
    syncSaveSearch(request.timeStamp)

    const stampRecievedMessage = "Navigation timeStamp recieved: " + request.timeStamp
    sendResponse({status: stampRecievedMessage})
  }
);


function syncSaveSearch(timeStamp){
  var date = new Date(timeStamp).toString()
  /*
    sync storage object:
    {
      firstSearch = the first search made. used to make searches-per-day average in content script
      todaysSearches[] = an array of the searches made that day
      lifetimeSearchesTotal = the total searches made by this chrome user
    }
  */

  //retrieve queryosity sync storage
  chrome.storage.sync.get("queryosity", function(items){
    if (!chrome.runtime.lastError){
      console.log(items)
      var data = items.queryosity
      //FIRST SEARCH
      //if a first search has not been logged, log one.
      if(!data.firstSearch) data.firstSearch = {date:date, first:"First search logged!"}

      //TODAYS SEARCHES
      if(data.todaysSearches){
        const lastTodaysSearchesDate = new Date(data.todaysSearches[0].date)
        const todaysDate = new Date(date)
        if(lastTodaysSearchesDate.getDate() != todaysDate.getDate()){
          //clear array if search is happening in a new day
          data.todaysSearches = []
        }
        data.todaysSearches.push({date:date})
      }else{
        data.todaysSearches = []
        data.todaysSearches.push({date:date})
      }

      //LIFETIME SEARCHES
      //Increment lifetime searches counter
      if(data.lifetimeSearchesTotal){
        data.lifetimeSearchesTotal = data.lifetimeSearchesTotal + 1
      }else{
        data.lifetimeSearchesTotal = 1;
      }

      //Resave the updated items object to sync storage
      chrome.storage.sync.set({queryosity: data}, function() {
        console.log("Saving to sync storage...")
        if (chrome.runtime.lastError){ console.log("Could not save searches")}
      })

    } else {
      console.log("Failed to load sync storage for 'queryosity'")
    }

  })
}
