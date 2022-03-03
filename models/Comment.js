// see Pizza.js for more comments.
// see google docs, NoSQL and MongoDB - notes, Create a relationship between pizza and comments

const { Schema, model } = require('mongoose');

//  Remember that one of the biggest benefits of using MongoDB is that we can structure data 
// essentially as JSON. We saw this pretty clearly when we added toppings to the pizza! 
// Sometimes, however, we want the documents subarray data to be validated as well.
// We want to make sure that each comment for a pizza has the following properties of the
// specified data type.
const CommentSchema = new Schema({
  writtenBy: {
    type: String
  },
  commentBody: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = model('Comment', CommentSchema);

module.exports = Comment;