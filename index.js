const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
dotenv.config();
var flash = require("connect-flash");
var path = require('path');

const passport = require("passport");
const { loginCheck } = require("./auth/passport");

const expressLayouts = require('express-ejs-layouts');


loginCheck(passport);

// Mongo DB conncetion
const database = process.env.MONGOLAB_URI;
mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("e don connect"))
  .catch((err) => console.log(err));


// Template Engine
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', './Layouts/layout_shared');
app.set("view engine", "ejs");

//BodyParsing
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'oneboy',
  saveUninitialized: true,
  resave: true
}));
app.use(flash());

app.use(express.static('public'));
app.use('/bootstrap', express.static(__dirname + 'public/bootstrap'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/webfonts', express.static(__dirname + 'public/webfonts'));


app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/", require("./routes/route"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log("Server has started at port " + PORT));