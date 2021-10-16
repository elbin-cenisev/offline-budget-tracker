let budgetRecords = [];  // Holds all transactions
let myChart;

loadAllRecords();

// Load all records from the indexedDB "transactions"
function loadAllRecords() {
  var request = window.indexedDB.open("budgetRecords");

  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("budgetRecords", { keyPath: "id", autoincrement: true });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("value", "value", { unique: false });
    objectStore.createIndex("date", "date", { unique: false });
    
  };

  request.onerror = function (event) {
    console.log("Failure");
  };

  // If DB creation successful, create transaction to retrieve all information
  request.onsuccess = function (event) {
    var db = request.result;
    var transaction = db.transaction(["budgetRecords"]);
    var objectStore = transaction.objectStore("budgetRecords");
    var retrieveReq = objectStore.getAll();

    // If retrieval succeeded, save all records in global variable
    retrieveReq.onsuccess = function(event) {
      budgetRecords = retrieveReq.result;
      console.log(budgetRecords);
    }
  };
}