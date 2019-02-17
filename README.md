# Pollo Backend [![Build Status](https://travis-ci.org/cuappdev/pollo-backend.svg?branch=master)](https://travis-ci.org/cuappdev/pollo-backend)

### Setting up database:
Make sure `PostgreSQL` is installed. After installation, start `PostgreSQL` and run the command
````
CREATE DATABASE pollo;
````
If you get a database error, upon running `npm start` and you already have the database created try
````
DROP DATABASE pollo;
CREATE DATABASE pollo;
````
Connect to the database by running
````
psql pollo
````

### Required variables:
Create a .env file in the repository with the following contents:
````bash
export DB_HOST=localhost
export DB_USERNAME=FILL_IN
export DB_PASSWORD=FILL_IN
export DB_NAME=pollo
export GOOGLE_CLIENT_ID=FILL_IN
export GOOGLE_CLIENT_SECRET=FILL_IN
export GOOGLE_REDIRECT_URI=FILL_IN
export NODE_ENV=development
````
Using [`autoenv`](https://github.com/kennethreitz/autoenv) to make a `.env` file with the above contents in the project directory is recommended.
Otherwise, you need source it using `source .env`.

### To run:
Make sure you have [`Node.js`](https://nodejs.org/en/download/) installed, and then run
````bash
npm install (first time)
npm start
````
### To test:
Run the following commands in separate windows (server must be running to test routes).
````
npm start
npm test
````

### To generate and open docs:
````bash
npm run docs
````
