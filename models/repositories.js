const mongoose = require('mongoose')

const Schema = mongoose.Schema

const repository = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  owner: String,
  canvas: Array,
  users: 
    [
        {
            user: Schema.Types.ObjectId,
            lastCommit: Date,
            pixels: Number
        }
    ],
}, {collection: 'repository'})

module.exports = mongoose.model('repository', repository)

