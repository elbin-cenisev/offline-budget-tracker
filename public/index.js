let budgetRecords = [];  // Holds all transactions
let myChart;

loadAllRecords();

// Loads all records from the indexedDB "budgetRecords"
function loadAllRecords() {
  var request = window.indexedDB.open("budgetRecords");

  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    db.createObjectStore("budgetRecords", { keyPath: "id", autoIncrement: true });
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
    retrieveReq.onsuccess = function (event) {
      budgetRecords = retrieveReq.result;
      console.log(budgetRecords);
    }
  };
}

// Handles local creation of new budget record
function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  budgetRecords.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // save to indexedDB
  saveRecord(transaction);
}

// Handles recalculation and display of total
function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = budgetRecords.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

// Handles population of record table
function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  budgetRecords.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

// Handles drawing the record chart
function populateChart() {
  // copy array and reverse it
  let reversed = budgetRecords.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: "Total Over Time",
        fill: true,
        backgroundColor: "#6666ff",
        data
      }]
    }
  });
}

// Handles saving of new record to indexedDB "budgetRecords"
function saveRecord(newRecord) {
  var request = window.indexedDB.open("budgetRecords");

  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    db.createObjectStore('budgetRecords', {keyPath: 'id', autoIncrement:true});
  };

  request.onerror = function (event) {
    console.log("Failure");
  };

  // If DB creation successful, create transaction to retrieve all information
  request.onsuccess = function (event) {
    var db = request.result;
    var transaction = db.transaction(["budgetRecords"], "readwrite");
    var objectStore = transaction.objectStore("budgetRecords");
    console.log(objectStore);
    var addRequest = objectStore.add(newRecord);

    // If retrieval succeeded, save all records in global variable
    addRequest.onsuccess = function (event) {
      console.log("success");
    }
  };
}

// Event Handlers for add and sub funds buttons
document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false);
};

