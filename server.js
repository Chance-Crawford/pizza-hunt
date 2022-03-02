const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(require('./routes'));

// Let's set up Mongoose to connect to MopngoDB when we start the app.
// Insert these 2 blocks of code above app.listen().
// mongoose.connect() tells Mongoose which database we want to connect to. 
// If the environment variable MONGODB_URI exists, like on Heroku when we 
// deploy later, it will use that. Otherwise, it will short-circuit to the local 
// MongoDB server's database at mongodb://localhost:27017/pizza-hunt. The 
// second argument is a set of configuration options Mongoose asks for more information about.
// But wait, did we create a database called pizza-hunt? What happens if Mongoose connects 
// to a database that isn't there? No worries—MongoDB will find and connect to the 
// database if it exists or create the database if it doesn't.
// If running locally, make requests to localhost:3001. 127.0.0.1 was put here because of an update
// to node, but the url will still run on localhost:3001
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pizza-hunt', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Use this to log mongo queries being executed!
mongoose.set('debug', true);

app.listen(PORT, () => console.log(`🌍 Connected on localhost:${PORT}`));
