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
Create a .envrc file in the repository by running the following and setting the correct values:
```bash
cp envrc.template .envrc
```

Using [`direnv`](https://direnv.net) is recommended. Otherwise, you need to source it using `source .env`.

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

### To access docs:
API documentation can be found at
````
/docs/
````
