# Northcoders News API

Northcoders News API is a project to develop a back-end API
using Express.js which queries a relational database via PostgreSQL.
The API is hosted using Render and the database is hosted using
ElephantSQL. The API is accessible via the link below:

https://nc-news-moag.onrender.com/api

The site may take some time to load, especially if it hasn't
been used recently.

## Requirements

To use this project, you need to install the following on your system:

-   Node 20.10.0 or greater
-   PostgreSQL 14.10 or greater

This project may work with some earlier version of Node and PostgreSQL,
but I cannot make any guarantees.

## Set up the project locally

### Clone Repo

Clone this repository and enter the directory:

```bash
git clone https://github.com/OskarBrzeski/nc-news.git

cd nc-news
```

### Environment Variables

Create the files `.env.development` and `.env.test` in the root directory of the project.

Inside of `.env.development`, write `PGDATABASE=nc_news`.

Inside of `.env.test`, write `PGDATABASE=nc_news_test`.

If access to your local database requires a password, include it in the files by writing `PGPASSWORD=your-password-here`.
You may omit the password if it is not required.

### Set up NPM

Install all of the dependencies using npm:

```bash
npm install
```

### Set up local database

Create the databases and seed the development database by running the following
scripts:

```bash
npm run setup-dbs
npm run seed
```

### Run server

Allow the server to listen to incoming requests by running the following:

```bash
node listen.js
```

This will allow you to make requests to the API via `localhost:9090/api`.
You may use tools such as Postman or Insomnia to send requests
containing JSON.

To close the server, terminate the node instance with Ctrl-C.

### Run tests

To run the test suite, run the following:

```bash
npm test
```

The test suite uses its own test database to ensure that all endpoints
work as intended.
