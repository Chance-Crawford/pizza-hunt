// see google docs, NoSQL and MongoDB - notes, Install Mongoose and Create the Pizza Model

// Just as you did with Sequelize, you'll create models for the Mongoose collections. 
// This step will allow you to interact with the database more easily.

// Although MongoDB doesn't enforce any data normalization, the database collections 
// will benefit from at least a little bit of structure. Mongoose fills that need, 
// allowing us to add rules for the data so that it's not a free-for-all. Mongoose 
// also provides us with a lot of similar capabilities that Sequelize offers, like data 
// validation, prebuilt methods to perform actions on a MongoDB database collection, and much more.

// We could import the entire mongoose library, but we only need to worry about the Schema 
// constructor and model function, so we'll just import them.
const { Schema, model } = require('mongoose');

// creating a general structure for the pizza documents even though we
// dont have to so that it is not just a 
// free for all.
// using the Schema constructor we imported from Mongoose, and define the 
// fields with specific data types. We don't have to define the fields, as 
// MongoDB will allow the data anyway, but for for clarity and usability, 
// we should regulate what the data will look like.
const PizzaSchema = new Schema({
    // See how we don't have to use special imported data types for the 
    // type definitions? Using MongoDB and Mongoose, we simply instruct the 
    // schema that this data will adhere to the built-in JavaScript data types, 
    // including strings, Booleans, numbers, and so on.
    pizzaName: {
      type: String
    },
    createdBy: {
      type: String
    },
    createdAt: {
      type: Date,
      // For the timestamp field, createdAt, we set a default value to the 
      // JavaScript Date.now function. If no value is provided in this field 
      // when the user creates new data, the Date.now function will be executed 
      // and will provide a timestamp. This way we don't have to create the 
      // timestamp elsewhere and send that data.
      default: Date.now
    },
    size: {
      type: String,
      default: 'Large'
    },
    // The brackets indicate an array as the data type. You could also specify 
    // Array in place of the brackets.
    toppings: []
});

// Now we need to actually create the model to get the prebuilt methods that Mongoose provides.
// create the Pizza model using the PizzaSchema
const Pizza = model('Pizza', PizzaSchema);

// export the Pizza model
module.exports = Pizza;