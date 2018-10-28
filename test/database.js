const chai = require('chai');
const expect = chai.expect;
const MongoDB = require('mongodb');
const Repositories = require('../models/repositories.js');

describe('describe', () => {
  it('should find the previously saved repo', (done) => {
    // Creating a 3x4 canva
    const array = new Array(3);
    for(let i = 0; i < 3; i++) {
      array[i] = new Array(4);
    }

    const newRepo = new Repositories({
      id: MongoDB.ObjectId(),
      name: 'TestRepo',
      owner: 'Sasha',
      canvas: array,
    });
    
    newRepo.save(() => {
       Repositories.findOne({owner: 'Sasha'})
      .then((foundRepo) => {
        expect(foundRepo.name).to.equal.name('wrong');
        done();
      })
    })
  })
})