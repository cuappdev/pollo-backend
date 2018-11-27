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

### Required variables:
````bash
export CHRONICLE_ACCESS_KEY=FILL_IN
export CHRONICLE_SECRET_KEY=FILL_IN
export DB_HOST=localhost
export DB_USERNAME=FILL_IN
export DB_PASSWORD=FILL_IN
export DB_NAME=pollo
export GOOGLE_CLIENT_ID=FILL_IN
export GOOGLE_CLIENT_SECRET=FILL_IN
export GOOGLE_REDIRECT_URI=FILL_IN
````
Using [`autoenv`](https://github.com/kennethreitz/autoenv) to make an .env file with the above contents in the project directory is recommended.

### To run:
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
