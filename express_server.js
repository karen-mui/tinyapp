const { render } = require("ejs");
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(cookieParser());

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 9);
};

app.post("/login", (req, res) => {
  console.log(req.body);
  res.cookie("userID", req.body.userID);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID", req.body.userID);
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = {
    userObj: users[req.cookies["userID"]],
    urls: urlDatabase
  };
  console.log('templateVars', templateVars)
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    userObj: users[req.cookies["userID"]]
  };
  res.render("urls_new", templateVars);
});

// gets the registration page
app.get("/register", (req, res) => {
  const templateVars = {
    userObj: users[req.cookies["userID"]]
  };
  res.render("register", templateVars);
});

// endpoint for registration
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  users[userID] = {
    userID: userID,
    email: req.body["email"],
    password: req.body["password"]
  };
  res.cookie("userID", userID);
  console.log(users[userID]);
  res.redirect("/urls");
});

// redirect from /urls to /urls:id
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// updates the :id with the new long URL input
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longUR;
  res.redirect("/urls");
});

// deletes a url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.get("/urls/:id", (req, res) => {
  const templateVars = {
    userObj: users[req.cookies["userID"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});