const mongoose = require('mongoose')

const Schema = mongoose.Schema

const repousers = new Schema({
    repo: Schema.Types.ObjectId,
    user: Schema.Types.ObjectId,
    lastCommit: String,
    pixels: Number
}, {collection: 'repousers'})

module.exports = mongoose.model('repousers', repousers)


[
        
    ],
