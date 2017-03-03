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

We will now add these to a local environment file so that Node can find your
database. Create a file called `.env` under the root of this git repo and enter
the following:
```
DB_HOST=localhost
DB_PORT=8091
DB_USERNAME=cluster_username
DB_PASSWORD=cluster_password
GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret
```
Replacing `cluster\_username` and `cluster\_password` with the admin username
and password for your local couchbase db which you setup earlier.

`GOOGLE\_CLIENT\_ID` and `GOOGLE\_CLIENT\_SECRET` are the id and secret used
to authenticate sign ins. You can obtain these on the [Google API Console](https://console.developers.google.com/project/_/apiui/apis/library)

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
This will compile all `\*.ts` scripts in the `src/` directory and output them
to `dist/`. Alternatively, you can set gulp to auto-compile every time you make
a change to the project by running.
```
gulp
```

If this is your first time running the app locally, you'll need to setup the db
before you can run the app. After compiling, run
```
npm setup_db
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
