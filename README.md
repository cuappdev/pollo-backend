# clicker-backend
Backend for the clicker app


## Local Development

Make sure you have docker, node >= 4.8.0, and npm installed locally.

### Setting up Couchbase

This is a one time setup. run the following command to start a community edition
Couchbase server in docker.

`docker run -d --name db -p 8091-8094:8091-8094 -p 11210:11210 couchbase:community-4.0.0`

Next, point your browser to `localhost:8091`. You should see a page to setup
Couchbase. You can go ahead and stick with the default settings. After going
through the setup, Couchbase will be running locally.

### Connecting NodeJS to Couchbase

During the setup phase, you should have set a username & password for your
local Couchbase server. We will now add these to a local environment file so
that Node can find your database. Create a file called `.env` under the root
of this git repo and enter the following

```
DB_HOST=localhost
DB_USER=couchbaseUsername
DB_PASS=couchbasePassword
```

Replacing `couchbaseUsername` and `couchbasePassword` with your username
and password respectively.

### Starting Clicker backend

Make sure the Couchbase server is running and the .env file is setup properly,
then run the command

`npm start`

This will run the application locally on port 8080.
