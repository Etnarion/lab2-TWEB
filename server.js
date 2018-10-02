console.log('Server-side code running');

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
var bodyParser = require('body-parser');
// import ObjectId
const ObjectId = require('mongodb').ObjectId;
app.use(bodyParser.json({limit: '2mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({limit: '2mb', extended: true, parameterLimit: 1000000})); // support encoded bodies
// serve files from the public directory
app.use(express.static('public'));

// connect to the db and start the express server
var db;

// ***Replace the URL below with the URL for your database***
const url =  'mongodb://localhost:27017/gitart';
// E.g. for option 2) above this will be:
// const url =  'mongodb://localhost:21017/databaseName';

MongoClient.connect(url, (err, database) => {
  if(err) {
    return console.log(err);
  }
  db = database;
  // start the express web server listening on 8080
  app.listen(8080, () => {
    console.log('listening on 8080');
  });
});

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/save', (req, res) => {
    var id = req.body._id;
    var canvas = req.body.canvas;
    db.collection("repository").updateOne({"_id": ObjectId.createFromHexString(id)}, {$set: {"canvas": canvas}}, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
    });
})

app.post('/repo', (req, res) => {
  //search database for repo with that name
  console.log(req.body.name);
  var repo = db.collection("repository").findOne({"name":req.body.name}).then(
    function(data) {
      res.send(data);
    }
  );
  
})