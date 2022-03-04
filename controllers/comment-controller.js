// see pizza-controller.js for more comments
// see google docs, NoSQL and MongoDB - notes, Comment controller methods.
const { Comment, Pizza } = require('../models');

// So we've added the virtual to the Pizza model, but we're not using it yet. 
// Remember that we'll never directly query on a comment to see its data. 
// We'll only see comments when we view a pizza’s data, including the associated comments. 
// This does reduce the number of routes we'll have to set up, but we still need to 
// create functionality for creating and deleting comments.
const commentController = {
  // Remember that when we create a comment, it’s not a standalone comment; 
  // it belongs to a pizza. We need to know exactly which pizza we’re working with.
  // add comment to pizza.
  // destructuring the params and body from the req object that gets passed into the method.
  addComment({ params, body }, res) {
    console.log(body);
    Comment.create(body)
      // create a comment, then take the new comment's id.
      .then(({ _id }) => {
          // We're also returning the pizza Promise here so that we can do something 
          // with the results of the Mongoose operation. Again, because we passed 
          // the option of new: true, we're receiving back the updated pizza 
          // (the pizza with the new comment included).
        return Pizza.findOneAndUpdate(
          // use the pizza id from the param property to find the pizza
          { _id: params.pizzaId },
          // push the newly created comment object to that pizza document's comments array.
          // Note here that we're using the $push method to add the comment's _id to the 
          // specific pizza we want to update. The $push method works just the same way 
          // that it works in JavaScript—it adds data to an array. All of the MongoDB-based 
          // functions like $push start with a dollar sign ($), making it easier to look at 
          // functionality and know what is built-in to MongoDB and what is a custom noun the 
          // developer is using.
          { $push: { comments: _id } },
          // response will be the new updated pizza data.
          { new: true }
        );
      })
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => res.json(err));
  },

  // We’ll create and remove replies almost exactly like we did with comments, but it’s actually a 
  // little simpler this time. Luckily, replies exist directly within a comment.
  // With new replies, we aren't actually creating a reply document; we're just 
  // updating an existing comment.
  addReply({ params, body }, res) {
    Comment.findOneAndUpdate(
      // find comment based on id
      { _id: params.commentId },
      // push new reply object from body into the replies array of the respective comment instance.
      { $push: { replies: body } },
      { new: true }
    )
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => res.json(err));
  },

  // update the comment by removing the reply subdocument stored
  // inside it's array.
  removeReply({ params }, res){
    Comment.findOneAndUpdate(
      { _id: params.commentId },
      // Here, we're using the MongoDB $pull operator to remove the specific 
      // reply from the replies array where the replyId matches the value of 
      // params.replyId passed in from the route.
      { $pull: { replies: { replyId: params.replyId } } },
      { new: true }
    )
      .then(dbPizzaData => res.json(dbPizzaData))
      .catch(err => res.json(err));
  },

  // remove comment
  // Now, for the removeComment() method, remember that not only do we need to 
  // delete the comment, but we also need to remove it from the pizza it’s associated with.
  // First we'll delete the comment, then we'll use its _id to remove it from the pizza.
  removeComment({ params }, res) {
      // get comment id from req.params, then delete that comment object.
      // The first method used here, .findOneAndDelete(), works a lot like 
      // .findOneAndUpdate(), as it deletes the document while also returning its data.
    Comment.findOneAndDelete({ _id: params.commentId })
      // We then take that data and use it to identify and remove it from the 
      // associated pizza using the Mongo $pull operation.
      .then(deletedComment => {
        if (!deletedComment) {
          return res.status(404).json({ message: 'No comment with this id!' });
        }
        // get pizza id from params to find the pizza the comment was associated with
        // (the comment being the sub document).
        return Pizza.findOneAndUpdate(
          { _id: params.pizzaId },
          // remove the comment from the associated pizza.
          { $pull: { comments: params.commentId } },
          { new: true }
        );
      })
      // Lastly, we return the updated pizza data, now without the _id of the comment 
      // in the comments array, and return it to the user.
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => res.json(err));
  }
};

module.exports = commentController;