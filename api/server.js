const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session')//install dependency as global npm i express-session -g
const KnexSessionStore = require('connect-session-knex')(session) // install this to save session on DB instead of broswer memory

const usersRouter = require("../users/users-router.js");
const authRouter = require("../auth/auth-router.js");

const requiresAuth = require('../auth/requires-auth.js')
const dbConnection = require('../database/connection.js')

const server = express();

const sessionConfig = {
    name: 'monster',
    secret: process.env.SESSION_SECRET || 'keep it secret, keep it safe',
    cookie: {
        maxAge: 1000 * 60 * 10, //10 minutes in milliseconds
        secure: process.env.COOKIE_SECURE || false,  //true means only use over https (in production, set to false in development)
        httpOnly: true, //JS code on the client cannot access the session cookie. (ALWAYS true)
    },
    resave: false,
    saveUninitialized: true, //GDPR compliance, read the docs
    store: new KnexSessionStore({
        knex: dbConnection,
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 6000, // delete expired sessions in Milliseconds
    })
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig)) // turns on sessions

server.use("/api/users", requiresAuth, usersRouter);
server.use('/api/auth', authRouter)

server.get("/", (req, res) => {
    res.json({ api: "up" });
});

module.exports = server;

// const httpMessage = {
//   headers: {
//     "set-cookie": { name, value },
//   },
//   body: {

//   }
// }
