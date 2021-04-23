document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get("queryosity", function(data) {
    const storage = data.queryosity
    const todaysQuerys = storage.todaysSearches.length;
    const lifetimeQuerys = storage.lifetimeSearchesTotal
    const personalBest = storage.oneDaySearchRecord

    const querysPerDay = qpd(storage)
    const daysSearching = calcDaysSearching(storage)

    document.getElementById('querys-per-day-number').innerHTML = (querysPerDay)

    document.getElementById('lifetime-querys-number').innerHTML = lifetimeQuerys
    document.getElementById('todays-querys-number').innerHTML = todaysQuerys
    document.getElementById('days-searching-number').innerHTML = daysSearching
    document.getElementById('personal-best-number').innerHTML = personalBest

    document.getElementById('x-button').addEventListener("click", function(){
      window.close()
    })

  })

  // document.getElementById('get-search-btn').addEventListener("click", getSyncStorage)
  // document.getElementById('clear-search-btn').addEventListener("click", clearSyncStorage)
  // document.getElementById("download-report").addEventListener("click", DownloadSearchesReport)

})
function calcDaysSearching(data){
  const firstSearchDate = new Date(data.firstSearch.date).getTime()
  const today = new Date().getTime()

  const msPerDay = 1000 * 60 * 60 * 24

  const daysSearching =  Math.ceil((today - firstSearchDate) / msPerDay)

  return daysSearching
}

function qpd(data){
  const firstSearchDate = new Date(data.firstSearch.date).getTime()
  const today = new Date().getTime()

  const msPerDay = 1000 * 60 * 60 * 24

  const daysSearching =  Math.ceil((today - firstSearchDate) / msPerDay)
  const qpdAverage = data.lifetimeSearchesTotal / daysSearching

  return Math.round(qpdAverage);
}

function calcQuerysToday(searches){
  const today = new Date()
  var searchDay, searchMonth, searchYear
  var count = 0


  searches.forEach((item, i) => {
      searchDay = new Date(item.date)
      searchYear = searchDay.getFullYear()
      searchMonth = searchDay.getMonth()
      searchDay = searchDay.getDate()
      if(today.getDate() == searchDay && today.getMonth() == searchMonth && today.getFullYear() == searchYear){
        count++
      }
  })

  return count
}

function calcQuerysPerDay(searches){
  //millaseconds per day: 1000ms/s * 60s/m * 60m/h * 24h/d
  const msPerDay = 1000 * 60 * 60 * 24

  //gets time of the first search as millaseconds from epoch
  const firstSearch = new Date(searches[0].date).getTime()
  //gets time of the most recent search as millaseconds from epoch
  const lastSearch = new Date(searches[searches.length-1].date).getTime()

  //Math.ceil rounds up
  var daysSearching =  Math.ceil((lastSearch - firstSearch) / msPerDay)
  var searchesPerDayAvg = searches.length / daysSearching

  return Math.round(searchesPerDayAvg)

}



/*
##################### Dev purposes only #####################
*/
function clearSyncStorage(){
  var empty = {}
  chrome.storage.sync.set({ "queryosity" : empty }, function() {
    if (chrome.runtime.error) {
      console.log("Failed to clear sync storage");
    }
  })
}

function getSyncStorage(){
  chrome.storage.sync.get("queryosity", function(data) {console.log(data.queryosity)})

}

function DownloadSearchesReport() {
    chrome.storage.sync.get("searches", function(data) {
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
