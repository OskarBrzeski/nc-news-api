# Northcoders News API

## How to setup
Create the files `.env.development` and `.env.test` in the root directory of the project.

Inside of `.env.development`, write `PGDATABASE=nc_news`.

Inside of `.env.test`, write `PGDATABASE=nc_news_test`.

If access to your database requires a password, include it in the files by writing `PGPASSWORD=your-password-here`.
You may omit the password if it is not required.
