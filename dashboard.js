/*

The Dashboard script is the one that runs when the extension window is loaded. That is, when dashboard.html is loaded
upon the user opening the queryosity window from the icon next to the search bar.

This script fetches the data from the browsers sync storage using the chrome API. The sync storage data persists across all
instances of chrome in which a user is logged in.

The fetched data is an object structured like this:
{
  firstSearch = the first search made. used to make searches-per-day average in dashboard script,
  todaysSearches[] = an array of the searches made that day,
  lifetimeSearchesTotal = the total searches made by this chrome user,
  oneDaySearchRecord = highest number of searches made in a single day,
}

Also in this script are several functions that take these values and calculate the querys per day and the number of days
the extension has been used.

*/

document.addEventListener('DOMContentLoaded', function() {

  //fetch sync data
  chrome.storage.sync.get("queryosity", function(data) {
    const storage = data.queryosity

    const todaysQuerys = storage.todaysSearches.length;
    const lifetimeQuerys = storage.lifetimeSearchesTotal
    const personalBest = storage.oneDaySearchRecord

    const querysPerDay = qpd(storage)
    const daysSearching = calcDaysSearching(storage)

    document.getElementById('querys-per-day-number').innerHTML = querysPerDay

    document.getElementById('lifetime-querys-number').innerHTML = lifetimeQuerys
    document.getElementById('todays-querys-number').innerHTML = todaysQuerys
    document.getElementById('days-searching-number').innerHTML = daysSearching
    document.getElementById('personal-best-number').innerHTML = personalBest

    document.getElementById('x-button').addEventListener("click", function() {
      window.close()
    })

  })

  // document.getElementById('get-search-btn').addEventListener("click", getSyncStorage)
  // document.getElementById('clear-search-btn').addEventListener("click", clearSyncStorage)
  // document.getElementById("download-report").addEventListener("click", DownloadSearchesReport)

})


function calcDaysSearching(data) {
  /*
  Javascript date object stores the time in millaseconds since epoch.

  To determine the number of days the user has been searching with the extension installed,
  the first search date and the current days date are subtracted from one another then devided by
  the number of ms in one day

  1000ms/s * 60s/m * 60m/h * 24h/d
  */
  const firstSearchDate = new Date(data.firstSearch.date).getTime()
  const today = new Date().getTime()

  const msPerDay = 1000 * 60 * 60 * 24

  const daysSearching = Math.ceil((today - firstSearchDate) / msPerDay)

  return daysSearching
}

function qpd(data) {
  /*
    To determine the average querys made per day, first the same method implemented in calcDaysSearching()
    is used to get the number of days for the average. Then, the number of searches made since the extension has
    been installed is devided by this number of days, yielding an average searches/day.
  */
  const firstSearchDate = new Date(data.firstSearch.date).getTime()
  const today = new Date().getTime()

  const msPerDay = 1000 * 60 * 60 * 24

  const daysSearching = Math.ceil((today - firstSearchDate) / msPerDay)
  var qpdAverage = data.lifetimeSearchesTotal / daysSearching

  //round to one decimal
  qpdAverage = Math.round(qpdAverage * 10) / 10

  return qpdAverage;
}

function calcQuerysPerDay(searches) {
  //millaseconds per day: 1000ms/s * 60s/m * 60m/h * 24h/d
  const msPerDay = 1000 * 60 * 60 * 24

  //gets time of the first search as millaseconds from epoch
  const firstSearch = new Date(searches[0].date).getTime()
  //gets time of the most recent search as millaseconds from epoch
  const lastSearch = new Date(searches[searches.length - 1].date).getTime()

  //Math.ceil rounds up
  var daysSearching = Math.ceil((lastSearch - firstSearch) / msPerDay)
  var searchesPerDayAvg = searches.length / daysSearching

  return Math.round(searchesPerDayAvg)

}



/*
##################### Dev purposes only #####################
*/
function clearSyncStorage() {
  var empty = {}
  chrome.storage.sync.set({
    "queryosity": empty
  }, function() {
    if (chrome.runtime.error) {
      console.log("Failed to clear sync storage");
    }
  })
}

function getSyncStorage() {
  chrome.storage.sync.get("queryosity", function(data) {
    console.log(data.queryosity)
  })

}

function DownloadSearchesReport() {
  chrome.storage.sync.get("queryosity", function(data) {
    var arr = data.searches

    //Convert JSON Array to string.
    var json = JSON.stringify(arr);

    //Convert JSON string to BLOB.
    json = [json];
    var blob1 = new Blob(json, {
      type: "text/plain;charset=utf-8"
    });

    //Check the Browser.
    var isIE = false || !!document.documentMode;
    if (isIE) {
      window.navigator.msSaveBlob(blob1, "SearchesReport.txt");
    } else {
      var url = window.URL || window.webkitURL;
      link = url.createObjectURL(blob1);
      var a = document.createElement("a");
      a.download = "SearchesReport.txt";
      a.href = link;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  })
}
