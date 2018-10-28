# Gitart
Presents a pixel art drawing for each repository on GitHub. Commiting on repositories rewards users with pixels that can be put on a public drawing linked to the repository.
## Running locally
### Prerequisites
This has only been tested on Linux Mint. The startup script cannot be run on Windows.  
To run this, Docker and Node version >= 6.9.2 must be installed
### Dev environment
To run it locally, run the runlocal.sh script and go to localhost:8000  
Database resets every time the script is executed. Please install MongoDb on your computer and run ./db/mongodb/script.js if you want persistant datas.
