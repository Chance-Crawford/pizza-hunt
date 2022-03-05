// see google docs, NoSQL and MongoDB - notes, Create the IndexedDB Connection
// and the 2 sections before that for more information.

// create variable to hold local indexedDB connection object when connection
// is complete
let db;
// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1
// act as an event listener for the database. That event listener is created when we open 
// the connection to the database using the indexedDB.open() method.
// As part of the browser's window object, indexedDB is a global variable. Thus, we could say 
// window.indexedDB, but there's no need to. The .open() method we use here takes the following 
// two parameters:
// The name of the IndexedDB database you'd like to create (if it doesn't exist) or connect to 
// (if it does exist). We'll use the name pizza_hunt.
// The version of the database. By default, we start it at 1. This parameter is used 
// to determine whether the database's structure has changed between connections. 
// Think of it as if you were changing the columns of a SQL database.
const request = indexedDB.open('pizza_hunt', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
// The listener we just added will handle the event of a change that needs to be made to the 
// database's structure. IndexedDB infers that a change needs to be made when the database 
// is first connected (which we're doing now) or if the version number changes.
// Thus, this onupgradeneeded event will emit the first time we run this code and create 
// the new_pizza object store. The event won't run again unless we delete the database 
// from the browser or we change the version number in the .open() method to a value of 2, 
// indicating that our database needs an update.
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // Like other database systems, the IndexedDB database itself doesn't hold the data. 
    // In SQL, tables hold the data; likewise, in MongoDB, collections hold the data. In 
    // IndexedDB, the container that stores the data is called an object store. We can't 
    // create an object store until the connection to the database is open, emitting an 
    // event that the request variable will be able to capture. Let's add that now.
    // create an object store (table) called `new_pizza`, set it to have an auto 
    // incrementing primary key of sorts 
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store 
    // (from onupgradedneeded event above) or simply established a connection, 
    // save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
        uploadPizza();
    }
};
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This saveRecord() function will be used in the add-pizza.js file's form submission 
// function if the fetch() function's .catch() error method is executed.
// Remember, the fetch() function's .catch() method is only executed on network failure!
// This function will be executed if we attempt to submit a new pizza and there's 
// no internet connection.
// Let's go ahead and add this function to be executed in add-pizza.js
function saveRecord(record) {
    // open a new transaction with the indexed database with read and write permissions.
    // With IndexedDB, we don't always have that direct connection like we do with SQL 
    // and MongoDB databases, so methods for performing CRUD operations with IndexedDB 
    // aren't available at all times. Instead, we have to explicitly open a transaction, 
    // or a temporary connection to the database. This will help the IndexedDB database maintain 
    // an accurate reading of the data it stores so that data isn't in flux all the time.
    const transaction = db.transaction(['new_pizza'], 'readwrite');
  
    // access the object store for `new_pizza`
    // Once we open that transaction, we directly access the new_pizza object store, 
    // because this is where we'll be adding data.
    const pizzaObjectStore = transaction.objectStore('new_pizza');
  
    // add record to your store with add method
    // Finally, we use the object store's .add() method to insert data 
    // into the new_pizza object store.
    pizzaObjectStore.add(record);
}

// We can now save pizza to IndexedDB as a fallback option in situations of no internet. 
// But, as we mentioned earlier, what good is that unless we upload the pizza when we 
// regain that connection?
// We need to create a function that will handle collecting all of the data from the 
// new_pizza object store in IndexedDB and POST it to the server, so let's do that now.
function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');
  
    // access your object store for new_pizza
    const pizzaObjectStore = transaction.objectStore('new_pizza');
  
    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();
  
    // Now, you may think that the getAll variable will automatically 
    // receive the data from the new_pizza object store, but 
    // unfortunately it does not. Because the object stores can be used for 
    // both small and large file storage, the .getAll() method is an asynchronous 
    // function that we have to attach an event handler to in order to retrieve the data. 
    // Let's add that next.
    // Now the getAll.onsuccess event will execute after the .getAll() method completes 
    // successfully. At that point, the getAll variable we created above it will have a 
    // .result property that's an array of all the data we retrieved from the 
    // new_pizza object store.
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            // If there's data to send, we send that array of data we just retrieved to the 
            // server at the POST /api/pizzas endpoint. Fortunately, the Mongoose .create() 
            // method we use to create a pizza can handle either single objects or an array 
            // of objects, so no need to create another route and controller method to 
            // handle this one event.
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                // after getting the parsed pizza data back from the database
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // On a successful server interaction, we'll access the object 
                    // store one more time and empty it, as all of the data that was 
                    // there is now in the database.
                    // open one more transaction
                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    // access the new_pizza object store again
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    // clear all items in your store
                    pizzaObjectStore.clear();

                    alert('All saved pizza has been submitted!');
                })
                .catch(err => {
                console.log(err);
                });
        }
    };
}

// But what happens if the internet outage is temporary and it comes back one 
// minute after it saves to IndexedDB? What can the user do to trigger 
// this uploadPizza() function?
// Well, they won't have to do anything, instead, we'll add a browser 
// event listener to check for a network status change!
// Here, we instruct the app to listen for the browser regaining internet connection 
// using the online event. If the browser comes back online, we execute the 
// uploadPizza() function automatically.
// listen for app coming back online to upload any pizzas that may have been 
// uploaded during the outage.
window.addEventListener('online', uploadPizza);

module.exports = {
    saveRecord
}