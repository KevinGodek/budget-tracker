let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveHistory(history) {
  const transaction = db.transaction(['pending'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('pending');

  transactionObjectStore.add(history);
}

function uploadTransactions() {
  const transaction = db.transaction(['pending'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('pending');
  const getAll = transactionObjectStore.getAll();
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['pending'], 'readwrite');
          const transactionObjectStore = transaction.objectStore('pending');
          transactionObjectStore.clear();

          alert('All transactions submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadTransactions);