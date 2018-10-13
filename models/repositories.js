const mongoose = require('mongoose')

const Schema = mongoose.Schema

const repository = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  canvas: Array
}, {collection: 'repository'})

module.exports = mongoose.model('repository', repository)

