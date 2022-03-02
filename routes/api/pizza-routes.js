// see google docs, NoSQL and MongoDB - notes, Create the pizza api routes.

// a structure that separates routes and functionality completely. 
// For this project, you’ll create the functionality in controllers and the 
// endpoints in routes. You’ll end up with more files but much cleaner code.

const router = require('express').Router();

// import all the functions for the controller logic.
// Instead of importing the entire object and having to do 
// pizzaController.getAllPizza(), we can simply destructure the method names 
// out of the imported object and use those names directly.
const {
    getAllPizza,
    getPizzaById,
    createPizza,
    updatePizza,
    deletePizza
  } = require('../../controllers/pizza-controller');

// Instead of creating duplicate routes for the individual HTTP methods, we can combine them!

// for each url route we are gonna call all the api functions associated at that route

// Set up GET all and POST at /api/pizzas
router
  .route('/')
  // the get function for the home api route.
  // getAllPizza function returns all the pizzas. This GET function will be triggered
  // at the "/" route (api/pizzas/).
  // See how we simply provide the name of the controller method as the callback? 
  // That's why we set up those methods to accept req and res as parameters!
  .get(getAllPizza)
  // the post function for the home api route
  .post(createPizza);

// Set up GET one, PUT, and DELETE at /api/pizzas/:id
router
  .route('/:id')
  .get(getPizzaById)
  .put(updatePizza)
  .delete(deletePizza);

module.exports = router;