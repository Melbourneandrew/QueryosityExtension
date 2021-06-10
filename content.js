/*
Content script runs as soon as content is loaded in a tab
*/
// console.log("Content Script Loaded.")
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
)

function syncSaveSearch(timeStamp){
  var date = new Date(timeStamp).toString()
  /*
    sync storage object structure:
    {
      firstSearch = the first search made. used to make searches-per-day average in dashboard script
      todaysSearches[] = an array of the searches made that day
      lifetimeSearchesTotal = the total searches made by this chrome user
      oneDaySearchRecord = highest number of searches made in a single day
    }
  */

  //retrieve queryosity sync storage
  chrome.storage.sync.get("queryosity", function(items){
    if (!chrome.runtime.lastError){
      // console.log(items)
      var data
      if(!items.queryosity){
        chrome.storage.sync.set({queryosity: {initalized:"initalized"}}, function() {
          //console.log("Saving to sync storage...")
          if (chrome.runtime.lastError) console.log("Could not initalize'queryosity' in sync storage")
        })
      }else{
          data = items.queryosity
      }


      //if a first search has not been logged, log one.
      if(!data.firstSearch) data.firstSearch = {date:date, first:"First search logged!"}
      //for when extension is first installed.
      if(!data.todaysSearches){
        data.todaysSearches = {
          firstSearch: "",
          count: 0,
        }
      }
      //for when extension is first installed.
      if(!data.oneDaySearchRecord) data.oneDaySearchRecord = 0
      //for when extension is first installed.
      if(!data.lifetimeSearchesTotal) data.lifetimeSearchesTotal = 0
      //date of the last day searches were entered
      const previousFirstSearchOfDay = new Date(data.todaysSearches.firstSearch.date)

      //todays date generated from the date of the search being processed
      const todaysDate = new Date(date)

      /*
      If the last day a search was entered is not the same as the date
      the most recent search was entered, it is a new day and the days
      search total needs to be reset
      */
      if(previousFirstSearchOfDay.getDate() != todaysDate.getDate()){
        //ad new first search of the day
        data.todaysSearches.firstSearch = {date:date}
        //reset days searches to 0 if search is happening in a new day
        data.todaysSearches.count = 0;
      }

      //incriment todays searches
      data.todaysSearches.count = data.todaysSearches.count + 1;
      //increment lifetime searches total
      data.lifetimeSearchesTotal = data.lifetimeSearchesTotal + 1

      //check if this search sets a new daily search personal highest
      if(data.oneDaySearchRecord < data.todaysSearches.count){
        data.oneDaySearchRecord = data.todaysSearches.count
      }

      //Resave the updated items object to sync storage
      chrome.storage.sync.set({queryosity: data}, function() {
        //console.log("Saving to sync storage...")
        if (chrome.runtime.lastError) console.log("Could not save searches for 'queryosity'")
      })

    } else {
      console.log("Failed to load sync storage for 'queryosity'")
    }

  })
}
