// see google docs, NoSQL and MongoDB - notes, Create the pizza controller.

// a structure that separates routes and functionality completely. 
// For this project, you’ll create the functionality in controllers and the 
// endpoints in routes. You’ll end up with more files but much cleaner code.
const { Pizza } = require('../models');

// Now that we've created the file and directory, let's work on the functionality. 
// We'll create all of these functions as methods of the pizzaController object. 
// Because these methods will be used as the callback functions for the Express.js routes, 
// each will take two parameters: req and res.

const pizzaController = {
  // the functions will go in here as methods
  // This style of writing object methods is another new feature of JavaScript.
  // This way of writing object functions would 
  // be the same as writing, getAllPizza: function(){...}

  // get all pizzas
  // The first method, getAllPizza(), will serve as the callback function for the 
  // GET /api/pizzas route. It uses the Mongoose .find() method, much like the 
  // Sequelize .findAll() method.
  getAllPizza(req, res) {
    Pizza.find({})
      .then(dbPizzaData => res.json(dbPizzaData))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // get one pizza by id
  // The second method, .getPizzaById(), uses the Mongoose .findOne() method 
  // to find a single pizza by its _id. Instead of accessing the entire req, 
  // we've destructured params out of it, because that's the only data we need 
  // for this request to be fulfilled. If we can't find a pizza with that _id, 
  // we can check whether the returning value is empty and send a 404 status back to 
  // alert users that it doesn't exist.
  getPizzaById({ params }, res) {
    Pizza.findOne({ _id: params.id })
      .then(dbPizzaData => {
        // If no pizza is found, send 404
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // method for handling POST /api/pizzas to add a pizza to the database.
  // With this .createPizza() method, we destructure the body out of the Express.js 
  // req object because we don't need to interface with any of the other data it 
  // provides. Again, just like with Sequelize, in Mongoose we use the method 
  // .create() to create data. We send a 400 error back if something goes wrong, 
  // as we likely sent the wrong type of data for one of the fields.
  createPizza({ body }, res) {
    Pizza.create(body)
    .then(dbPizzaData => res.json(dbPizzaData))
    .catch(err => res.status(400).json(err));
  },

  // method for updating a pizza when we make a request to PUT /api/pizzas/:id.
  // update pizza by id
  updatePizza({ params, body }, res) {
    // With this .findOneAndUpdate() method, Mongoose finds a single document 
    // we want to update, then updates it and returns the updated document. If we 
    // don't set that third parameter, { new: true }, it will return the original 
    // document. By setting the parameter to true, we're instructing Mongoose to 
    // return the new version of the document in the response.
    Pizza.findOneAndUpdate({ _id: params.id }, body, { new: true })
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => res.status(400).json(err));
  },

  // let's create the method to delete a pizza from the 
  // database when we make a request to DELETE /api/pizzas/:id.
  deletePizza({ params }, res) {
    // In this example, we use the Mongoose .findOneAndDelete() method, which 
    // will find the document to be returned and also delete it from the database. 
    // Like with updating, we could alternatively use .deleteOne() or .deleteMany(), 
    // but we're using the .findOneAndDelete() method because it provides a little more 
    // data in case the client wants it.
    Pizza.findOneAndDelete({ _id: params.id })
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => res.status(400).json(err));
  }
};

module.exports = pizzaController;