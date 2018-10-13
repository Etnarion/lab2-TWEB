const mongoose = require('mongoose')

const Schema = mongoose.Schema

const users = new Schema({
  _id: Schema.Types.ObjectId,
  gitId: String,
  pixels: Number
}, {collection: 'user'})

module.exports = mongoose.model('user', users)

