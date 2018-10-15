// Imports
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const graphql = require('graphql')
const app = express();
const bodyParser = require('body-parser');
// import ObjectId
const MongoDB = require('mongodb');
const request = require('superagent');
const cookieParser = require('cookie-parser');
const conf = require('./conf.json');
// Get database models
const Repositories = require('./models/repositories.js');
const Users = require('./models/users.js');

const corsOptions = {
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '2mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true, parameterLimit: 1000000 })); // support encoded bodies
// serve files from the public directory
app.use(express.static('public'));
app.use(cookieParser());

const mongoOpt = {
  useNewUrlParser: true,
  reconnectTries: conf.db.reconnectTries,
  reconnectInterval: conf.db.reconnectInterval,
};
const mongoUrl = conf.db.url;

// MangoDB connection with retry
const connectWithRetry = () => {
  mongoose.connect(mongoUrl, mongoOpt)
    .then(
      () => {
        console.log('Connected to MongoDB');
      },
      (err) => {
        console.error('Failed to connect to MongoDB', err);
        setTimeout(connectWithRetry, 5000);
      }
    );
};

// Connect to MongoDB
connectWithRetry();

// Server
const server = app.listen(8000, () => {
  console.log('Node server listening at http://%s:%s', server.address().address, server.address().port);
});

let authUser;

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile('./public/index.html');
});

function getAuthUser(login) {
  Users.findOne({ gitId: login })
    .then((user) => {
      if (user == null) {
        authUser = new Users({
          _id: MongoDB.ObjectId(),
          gitId: login,
        });
        authUser.save();
      }
      authUser = user;
    });
}

app.get('/connect', (req) => {
  const accessToken = req.query.cookie;
  request
    .get(`https://api.github.com/user?access_token=${accessToken}`)
    .then((user) => {
      getAuthUser(user.body.login);
    });
});

app.post('/save', (req, res) => {
  Repositories.findById(req.body._id, (err, repo) => {
    repo.canvas = req.body.canvas;
    repo.save();
    res.send('Ok');
  });
});

app.post('/repo', (req, res) => {
  // search database for repo with that name
  Repositories.findOne({ name: req.body.data.name })
    .then(
      (data) => {
        if (data == null) {
          const array = new Array(120);
          for (let i = 0; i < 120; i++) {
            array[i] = new Array(160);
            array[i].fill('#fff');
          }

          const newRepo = new Repositories({
            _id: MongoDB.ObjectId(),
            name: req.body.data.name,
            owner: req.body.data.owner.login,
            canvas: array,
          });

          // Insert user in repositories collection
          // with 0 pixel
          const today = new Date();
          const newUser = {
            user: authUser._id,
            lastCommit: today.toISOString(),
            pixels: 0,
          };
          newRepo.users.push(newUser);

          newRepo.save();

          res.send({ value: 0, repo: newRepo });
        } else {
          let totalValue = 0;
          const today = new Date();
          let lastCommit = today.toISOString();
          data.users.forEach((user) => {
            if (user.user.toString() === authUser._id.toString()) {
              lastCommit = user.lastCommit;
              totalValue = user.pixels;
            }
          });
          request
            .get(`https://api.github.com/repos/${data.owner}/${data.name}/commits?author=${authUser.gitId}&since=${lastCommit}`)
            .then((result) => {
              let counter = 0;
              result.body.forEach((commit) => {
                counter++;
                request
                  .get(`https://api.github.com/repos/${data.owner}/${data.name}/commits/${commit.sha}`)
                  .then((singleCommit) => {
                    totalValue += (singleCommit.body.stats.total / 20) + 1;
                    if (counter === result.body.length) {
                      res.send({ value: totalValue, repo: data });
                    }
                  });
              });
            });
        }
      }
    );
});

// recent repositories search
app.get('/repos', (req, res) => {
  Repositories.find({ name: { $regex: req.query.text, $options: 'i' } })
    .then((data) => {
      res.send(data);
    });
});

app.get('/disconnect', (req, res) => {
  res.clearCookie('client');
  res.redirect('http://localhost:8000/');
});

// User authentication
app.get('/callback', (req, res) => {
  const code = req.query.code;

  request
    .post('https://github.com/login/oauth/access_token')
    .send({
      client_id: '4100c6839f33b3b4f29c',
      client_secret: 'd4e15a1fe2e5a69ff03fc2b8f728fad75640dbc6',
      code: `${code}`
    })
    .then((result) => {
      // get username with access token
      request
        .get(`https://api.github.com/user?access_token=${result.body.access_token}`)
        .then((user) => {
          getAuthUser(user.body.login);
        });
      res.cookie('client', result.body.access_token);
      res.redirect('http://localhost:8000/');
    });
});
