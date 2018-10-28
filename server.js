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
const RepoUsers = require('./models/repousers.js');

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

const mongoUrl = process.env.CONFIG;
const environment = process.env.ENV;
let clientId;
let clientSecret;
if (environment === 'local') {
  clientId = '6ebffe27fc6d66fb4546';
  clientSecret = '8e81ac372125aaa83f1f0dd5636a3b38975031c2';
} else {
  clientId = '4100c6839f33b3b4f29c';
  clientSecret = 'd4e15a1fe2e5a69ff03fc2b8f728fad75640dbc6';
}

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
const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Node server listening at http://%s:%s', server.address().address, server.address().port);
});

app.get('/clientId', (req, res) => {
  res.send(clientId);
});

app.post('/save', (req, res) => {
  Repositories.findById(req.body._id, (err, repo) => {
    repo.canvas = req.body.canvas;
    RepoUsers.findOne({ user: req.body.user, repo: req.body._id })
      .then((foundUser) => {
        const today = new Date();
        foundUser.lastCommit = today.toISOString().replace(/\s/g, '');
        foundUser.pixels = req.body.pixels;
        foundUser.save();
        repo.save();
        res.send('Ok');
      });
  });
});

app.post('/repo', (req, res) => {
  // search database for repo with that name
  Repositories.findOne({ name: req.body.repos.name })
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
            name: req.body.repos.name,
            owner: req.body.repos.owner.login,
            canvas: array,
          });

          // Insert user in repositories collection
          // with 0 pixel
          const today = new Date();
          request
            .get(`https://api.github.com/repos/${req.body.repos.owner.login}/${req.body.repos.name}/commits?author=${req.body.login}&since=${req.body.repos.created_at}?access_token=${req.body.accessToken}`)
            .then((commits) => {
              let startingPixels = 0;
              if (commits.body.length > 0) {
                startingPixels = 10;
              }
              const newUser = new RepoUsers({
                user: req.body.userId,
                lastCommit: today.toISOString().replace(/\s/g, ''),
                pixels: startingPixels,
              });

              newUser.save();

              newRepo.save();

              res.send({ value: startingPixels, repo: newRepo });
            });
        } else {
          let totalValue = 0;
          const today = new Date();
          let lastCommit = today.toISOString().replace(/\s/g, '');
          RepoUsers.findOne({ user: req.body.userId, repo: data._id })
            .then((repouser) => {
              if (repouser !== null) {
                lastCommit = repouser.lastCommit;
                totalValue = repouser.pixels;

                request
                  .get(`https://api.github.com/repos/${data.owner}/${data.name}/commits?author=${req.body.login}&since=${lastCommit}?access_token=${req.body.accessToken}`)
                  .then((result) => {
                    const promises = [];
                    result.body.forEach((commit) => {
                      promises.push(
                        request.get(`https://api.github.com/repos/${data.owner}/${data.name}/commits/${commit.sha}?access_token=${req.body.accessToken}`)
                      );
                    });
                    Promise.all(promises)
                      .then((commits) => {
                        commits.forEach((commit) => {
                          totalValue += Math.round((commit.body.stats.total / 10) + 1);
                        });
                        if (totalValue > 0) {
                          repouser.lastCommit = today.toISOString().replace(/\s/g, '');
                          repouser.pixels = totalValue;
                          repouser.save();
                        }
                        res.send({ value: totalValue, repo: data });
                      });
                  });
              } else {
                request
                  .get(`https://api.github.com/repos/${req.body.repos.owner.login}/${req.body.repos.name}/collaborators/${req.body.login}?access_token=${req.body.accessToken}`)
                  .then((isCollaborator) => {
                    let startingPixels = 0;
                    if (isCollaborator.statusCode === 204) {
                      startingPixels = 10;
                      totalValue = 10;
                    }
                    repouser = new RepoUsers({
                      repo: data._id,
                      user: req.body.userId,
                      lastCommit,
                      pixels: startingPixels
                    });
                    repouser.save();
                    res.send({ value: totalValue, repo: data });
                  });
              }
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
  res.clearCookie('access_token');
  res.clearCookie('user');
  res.clearCookie('login');
  res.redirect('/');
});

// User authentication
app.get('/callback', (req, res) => {
  const code = req.query.code;

  request
    .post('https://github.com/login/oauth/access_token')
    .send({
      client_id: clientId,
      client_secret: clientSecret,
      code: `${code}`
    })
    .then((result) => {
      // get username with access token
      request
        .get(`https://api.github.com/user?access_token=${result.body.access_token}`)
        .then((user) => {
          Users.findOne({ gitId: user.body.login })
            .then((authUser) => {
              if (authUser == null) {
                authUser = new Users({
                  _id: mongoose.Types.ObjectId(),
                  gitId: user.body.login,
                });
                authUser.save();
              }
              res.cookie('user', authUser._id.toString());
              res.cookie('login', authUser.gitId);
              res.cookie('access_token', result.body.access_token);
              res.redirect('/');
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });
});
