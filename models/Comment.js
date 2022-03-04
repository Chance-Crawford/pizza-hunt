// see Pizza.js for more comments.
// see google docs, NoSQL and MongoDB - notes, Create a relationship between pizza and comments

const { Schema, model, Types } = require('mongoose');

const dateFormat = require('../utils/dateFormat');

// schema for adding replies to comments to normalize the reply data.
// Just like comments, we could use another model for replies, but it’s 
// not really necessary since we'll never query for just reply data. Instead, 
// let's take advantage of some of the flexibility that MongoDB provides and create 
// replies as a subdocument array for comments.
const ReplySchema = new Schema(
  {
    // Here we'll need a unique identifier instead of the default _id field that 
    // is created since a reply is not a standalone model, so we'll add a custom replyId field. 
    // Despite the custom field name, we're still going to have it generate the same 
    // type of ObjectId() value that the _id field typically does, but we'll have to import 
    // that type of data first at the top of tyhe file.
    // set custom id to avoid confusion with parent comment _id
    replyId: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId()
    },
    replyBody: {
      type: String
    },
    writtenBy: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // While we're here, we should also update CommentSchema and ReplySchema to use toJSON 
      // and add getters to all timestamp-related fields. This is so the timestamp is 
      // formatted in a user friendly way.
      get: createdAtVal => dateFormat(createdAtVal)
    }
  },
  // Now add the toJSON field to BOTH schemas so that they both can use getter
  // functionality, as you did for the pizza's schema.
  {
    toJSON: {
      getters: true
    }
  }
);

//  Remember that one of the biggest benefits of using MongoDB is that we can structure data 
// essentially as JSON. We saw this pretty clearly when we added toppings to the pizza! 
// Sometimes, however, we want the documents subarray data to be validated as well.
// We want to make sure that each comment for a pizza has the following properties of the
// specified data type.
const CommentSchema = new Schema(
  {
    writtenBy: {
      type: String
    },
    commentBody: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: createdAtVal => dateFormat(createdAtVal)
    },
    // Now let's associate replies with comments. Update the CommentSchema to have the replies 
    // field populated with an array of data that adheres to the ReplySchema definition.
    // Note that unlike our relationship between pizza and comment data, replies will be 
    // nested directly in a comment's document and not referred to.
    replies: [ReplySchema]
  },
  {
    toJSON: {
      virtuals: true,
      getters: true
    },
    id: false
  }

);

// ext, let's add a virtual for CommentSchema to get the total reply count. 
// We'll use this later to combine the reply count with the comment count so 
// that users can get a full picture of the discussion around a pizza. 
CommentSchema.virtual('replyCount').get(function(){
  return this.replies.length;
});

const Comment = model('Comment', CommentSchema);

module.exports = Comment;