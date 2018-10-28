const chai = require('chai');

const expect = chai.expect;
const MongoDB = require('mongodb');
const mongoose = require('mongoose');
const Repositories = require('../models/repositories.js');

before((done) => {
  mongoose.connect('mongodb://localhost:27017/gitart');
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
    done();
  });
});

describe('describe', () => {
  it('should find the previously saved repo', (done) => {
    // Creating a 3x4 canva
    const array = new Array(3);
    for (let i = 0; i < 3; i++) {
      array[i] = new Array(4);
    }

    const newRepo = new Repositories({
      _id: MongoDB.ObjectId(),
      name: 'TestRepo',
      owner: 'Sasha',
      canvas: array,
    });

    newRepo.save(done);
  });

  it('should find a repo by its owner', (done) => {
    Repositories.find({ owner: 'Sasha' }, (err, repo) => {
      if (err) {
        throw err;
      }
      if (repo.length === 0) {
        throw new Error('not found');
      }
      done();
    });
  });
});

after((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(done);
  });
});
