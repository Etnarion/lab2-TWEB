const chai = require('chai');

const expect = chai.expect;
const MongoDB = require('mongodb');
const mongoose = require('mongoose');
const Repositories = require('../models/repositories.js');
const conf = require('../conf.json');
const utils = require('../utils/utils.js');

const mongoOpt = {
  useNewUrlParser: true,
  reconnectTries: conf.db.reconnectTries,
  reconnectInterval: conf.db.reconnectInterval,
};

before((done) => {
  mongoose.connect('mongodb://localhost:27017/gitart', mongoOpt);
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
    done();
  });
});

describe('describe', () => {
  it('should be possible to add a repository in the database', (done) => {
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
      expect(repo[0].name).to.equals('TestRepo');
      done();
    });
  });

  it('should merge DB canvas with a new one', (done) => {
    const dbCanvas = [
      ['b', 'b', 'b'],
      ['a', 'a', 'a'],
      ['a', 'a', 'a']
    ];
    const newCanvas = [
      ['a', 'a', 'a'],
      ['a', 'b', 'a'],
      ['a', 'a', 'a']
    ];
    const changedPixels = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ];
    const expectedCanvas = [
      ['b', 'b', 'b'],
      ['a', 'b', 'a'],
      ['a', 'a', 'a']
    ];
    expect(utils.mergeCanvas(dbCanvas, newCanvas, changedPixels)).to.eql(expectedCanvas);
    done();
  });
});

after((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(done);
  });
});
