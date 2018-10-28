echo 'Removing left overs containers'
docker kill gitart
docker rm gitart
cd db/mongodb
echo 'Building mongodb container...'
docker build -t mongodb .
echo 'Running mongodb container'
docker run -d -p 27017:27017 --name gitart mongodb
echo 'Waiting mongodb to start...'
sleep 5
echo 'Executing DB script...'
mongo < script.js
echo 'Starting Node.js...'
export ENV=local
export CONFIG=mongodb://localhost:27017/gitart
cd ../..
npm start
