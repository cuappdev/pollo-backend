# Clicker Backend

### Setting up database:
Make sure `PostgreSQL` is installed. After installation, start `PostgreSQL` and run the command
````
CREATE DATABASE clicker;
````

### Required variables:
````bash
export DB_HOST=localhost
export DB_USERNAME=FILL_IN
export DB_PASSWORD=FILL_IN
export DB_NAME=clicker
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
