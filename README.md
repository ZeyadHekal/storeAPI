### Information and Database Creation

## Information (retrieved from ENV variables)
Host: 127.0.0.1 (localhost)
Server Port: 3000
Database Port: 5432
Database_DEV: shopping
Database_TEST: shopping_test
Username: shopping
Password: password123

## Creating the Database
1- Connect into psql with a superuser (psql -U postgres)
2- Create the databases:
        CREATE DATABASE shopping;
        CREATE DATABASE shopping_test;
3- Create the user:
        CREATE USER shopping_user WITH PASSWORD 'password123';
4- Grant databases access to user:
        GRANT ALL PRIVILEGES ON DATABASE shopping TO shopping_user;
        GRANT ALL PRIVILEGES ON DATABASE shopping_test TO shopping_user;
5- Create tables with db-migrate: db-migrate up

### Package Installation, Configuration and Usage

## Package Installation
`npm install` To download packages

## Package Configuration
This project depends on environment variables to work.
These are the variables needed.
DB_HOST=(string: Host IP)
DB_PORT=(number: Database port)
SERVER_PORT=(number: Express server port)
DB_NAME=(string: DEV Database name)
DB_NAME_TEST=(string: Test Database name)
DB_USER=(string: Database user)
DB_PASSWORD=(string: Database user's password)
ENV=(string: dev as default for development environment and test for testing (used on testing))
SALT_ROUNDS=(number: Number of salt rounds. e.g. 10)
PASSWORD_PEPPER=(string: The pepper added to the password at its ending before hashing)
DEFAULT_ADMIN_USER=(string: Default admin account username)
DEFAULT_ADMIN_PASSWORD=(string: Default admin account password)
JWT_SECRET=(string: JWT Secret for signing and verifying tokens)

## Package Usage
`npm run watch`: For dev mode: auto transpile ts files and start the server on file changes
`npm run test`: Run the tests using jasmine
`npm run build`: Transpiles TS files to JS
`npm run start`: Starts the server from the transpiled files
