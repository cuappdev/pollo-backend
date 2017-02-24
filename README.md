# clicker-backend
Backend for the clicker app. NodeJS + Typescript + Couchbase

## Local Development

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
DB_PORT=8091
DB_USER=couchbaseUsername
DB_PASS=couchbasePassword
```

Replacing `couchbaseUsername` and `couchbasePassword` with your username
and password respectively.

### Starting Clicker backend

To install all project dependencies, run
```
npm install
```
You will have to run this everytime dependencies are added to the packages.json
file.

We use gulp to persistently compile Typescript files. Install gulp globally on
your computer.
```
npm install -g gulp
```
To compile this project, run
```
gulp scripts
```
This will compile all `*.ts` scripts in the `src/` directory and output them
to `dist/`. Alternatively, you can set gulp to auto-compile every time you make
a change to the project by running.
```
gulp
```

To start clicker-backend locally, run
```
npm start
```
which will run the application locally on port 8080.

To run the tests under `test/`, do
```
npm test
```
