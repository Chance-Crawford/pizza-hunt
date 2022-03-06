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

// function to format the created at date.
const dateFormat = require('../utils/dateFormat');

// creating a general structure for the pizza documents even though we
// dont have to so that it is not just a 
// free for all.
// using the Schema constructor we imported from Mongoose, and define the 
// fields with specific data types. We don't have to define the fields, as 
// MongoDB will allow the data anyway, but for for clarity and usability, 
// we should regulate what the data will look like.
const PizzaSchema = new Schema(
  {
    // See how we don't have to use special imported data types for the 
    // type definitions? Using MongoDB and Mongoose, we simply instruct the 
    // schema that this data will adhere to the built-in JavaScript data types, 
    // including strings, Booleans, numbers, and so on.
    pizzaName: {
      type: String,
      // When you started this project, you were able to iterate on the MongoDB 
      // data needs faster than you could have for SQL because MongoDB doesn't enforce 
      // any rules. This flexibility can help you quickly reach MVP by allowing you to 
      // test and scale your app without running into too many issues.
      // But now that we've solidified the idea for data storage and the app will soon 
      // be used by everyday people, we should add rules to help maintain some normalized 
      // data for the app to run smoothly. Remember, because MongoDB doesn’t care about 
      // schema at all, we need tools like Mongoose to help enforce any validation rules.
      // Just like Sequelize, when the required field option in Mongoose is set to true, 
      // it will require data to exist for that field.
      required: true,
      // Also notice the trim option that's been added, which works just like the JavaScript 
      // .trim() method and removes white space before and after the input string. You'll 
      // find that useful when working with username and password data.
      trim: true
    },
    createdBy: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      // For the timestamp field, createdAt, we set a default value to the 
      // JavaScript Date.now function. If no value is provided in this field 
      // when the user creates new data, the Date.now function will be executed 
      // and will provide a timestamp. This way we don't have to create the 
      // timestamp elsewhere and send that data.
      default: Date.now,
      // since the created at timestamp isnt very user friendly we'll use 
      // getters to transform the data by default every time it's queried.
      // In programming, a getter is typically a special type of function 
      // that takes the stored data you are looking to retrieve and modifies 
      // or formats it upon return. Think of it like middleware for your data!
      // To use a getter in Mongoose, we just need to add the key get to the 
      // field we are looking to use it with in the schema. Just like a virtual, 
      // the getter will transform the data before it gets to the controller(s).
      // With this get option in place, every time we retrieve a pizza, the value 
      // in the createdAt field will be formatted by the dateFormat() function and 
      // used instead of the default timestamp value. This way, we can use the timestamp 
      // value for storage, but use a prettier version of it for display.
      get: (createdAtVal) => dateFormat(createdAtVal)
    },
    size: {
      type: String,
      required: true,
      // In this example, the enum option stands for enumerable, a popular term in web 
      // development that refers to a set of data that can be iterated over—much like using 
      // the for...in loop to iterate through an object.
      // With this validation option in place, we provide an array of options that this size 
      // field will accept. If a user attempts to enter a pizza size not listed in the enum—
      // for example, a size value of "Super Mega Large"—the validation simply won't allow it.
      enum: ['Personal', 'Small', 'Medium', 'Large', 'Extra Large'],
      default: 'Large'
    },
    // The brackets indicate an array as the data type. You could also specify 
    // Array in place of the brackets.
    toppings: [],
    // Remember that you've dealt with associations already, when working with Sequelize. 
    // To connect two tables with Sequelize, you'd have to store a reference of the parent 
    // data's id with the child data.
    // In Mongoose, though, we can instruct the parent to keep track of its children, 
    // not the other way around. There aren't really restrictions for creating relationships, 
    // but we should try using a built-in Mongoose feature.
    // first add a comments array field to the Pizza schema.
    comments: [
      {
        // Specifically, we need to tell Mongoose to expect an ObjectId and to 
        // tell it that its data comes from the Comment model.
        type: Schema.Types.ObjectId,
        // The ref property is especially important because it tells the Pizza model 
        // which documents to search to find the right comments.
        ref: 'Comment'
      }
    ]
  },
  // we need to tell the schema that it can use virtuals.
  // To do so, you'll need to add the toJSON property to the schema options.
  // virtuals defined below.
  // Now again, we'll need to tell the Mongoose model that it should 
  // use any getter function we've specified. Update the toJSON object in 
  // the model options for the PizzaSchema.
  {
    toJSON: {
      virtuals: true,
      getters: true
    },
    // We set id to false because this is a virtual that Mongoose returns, 
    // and we don’t need it.
    id: false
  }
);

// The client has mentioned that they also want to get a count of how many comments a pizza has.
// To maintain this count as persistent data in the database, we'd have to update it anytime 
// someone adds or deletes a comment. But if possible, we want to avoid creating a helper 
// function, to reduce the complexity of the controllers. Luckily Mongoose has a built-in 
// solution for this dilemma, known as virtuals.
// Virtuals allow you to add virtual properties to a document that aren't stored in the 
// database. They're normally computed values that get evaluated when you try to 
// access their properties. For example a property like pizza.commentCount.
// Virtuals allow us to add more information to a database response so that we don't 
// have to add in the information manually with a helper before responding to the API request.
// get total count of comments and replies on retrieval.
// virtuals use a method to access a field that doesn't actually exist in the database
PizzaSchema.virtual('commentCount').get(function() {
  // return this pizza's comments length + the replies. Accesses the comments that are associated with
  // the pizza and returns the length.
  // Here we're using the .reduce() method to tally up the total of every comment with 
  // its replies. In its basic form, .reduce() takes two parameters, an accumulator 
  // and a currentValue. Here, the accumulator is total, and the currentValue is 
  // comment. As .reduce() walks through the array, it passes the accumulating total 
  // and the current value of comment into the function, with the return of the function 
  // revising the total for the next iteration through the array.
  // The .reduce() method can do more than just tally up sums, though. What if you 
  // needed to get the average years of experience of a team of software developers? 
  // Sure, you could write a for loop with some logic. Or, instead, you could write a 
  // clean map and reduce function. The reduce function can accept a custom callback function
  // as a parameter
  // that performs more complex operations.
  return this.comments.reduce((total, comment) => total + comment.replies.length + 1, 0);
});

// Now we need to actually create the model to get the prebuilt methods that Mongoose provides.
// create the Pizza model using the PizzaSchema
const Pizza = model('Pizza', PizzaSchema);

// export the Pizza model
module.exports = Pizza;