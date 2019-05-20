const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");


// Configure express server
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('tiny'));

// Add server routes to express
app.use(require("./routes"));

// Start listening
http.createServer(app)
    .listen(3000, function () {
        console.log('Listening on port 3000! Go to http://localhost:3000/')
    });
