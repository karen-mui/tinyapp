const { render } = require("ejs");
const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, checkUserPassword, getUserID, checkIfIdExists, getURLsForUser } = require("./helpers.js");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['e1d50c4f-538a-4682-89f4-c002f10a59c8', '2d310699-67d3-4b26-a3a4-1dbf2b67be5c'],
})
);

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {};

const users = {};



// / => homepage
app.get("/", (req, res) => {
  if (!req.session["userID"]) {
    res.redirect('/login')  
  } else {
    res.redirect('/urls')
  }
});


// /REGISTER => register a new user
app.get("/register", (req, res) => {
  if (req.session["userID"]) {
    res.redirect('/urls');

  } else {
    const templateVars = {
      userObj: users[req.session["userID"]]
    };
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  if (req.body["email"] === "" || req.body["password"] === "") {
    res.status(400).send('Invalid email or password');

  } else if (getUserByEmail(req.body["email"], users)) {
    res.status(400).send('Email already in use');

  } else {
    const userID = generateRandomString();
    users[userID] = {
      userID: userID,
      email: req.body["email"],
      hashedPassword: bcrypt.hashSync(req.body["password"], 10)
    };
    req.session["userID"] = userID;
    res.redirect("/urls");
  }
});


// /LOGIN
app.post("/login", (req, res) => {
  if (!getUserByEmail((req.body["email"]), users)) {
    res.status(403).send('Email cannot be found');

  } else if (!checkUserPassword(req.body["email"], req.body["password"], users)) {
    res.status(403).send('Password does not match');

  } else {
    const ID = getUserID(req.body["email"], users);
    req.session["userID"] = ID;
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  if (req.session["userID"]) {
    res.redirect('/urls');

  } else {
    const templateVars = {
      userObj: users[req.session["userID"]],
    };
    res.render("login", templateVars);
  }
});


// /LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  if (!req.session["userID"]) {
    res.status(401).send('Login to access page');

  } else {
    const userSpecificObj = getURLsForUser(req.session["userID"], urlDatabase);
    const templateVars = {
      userObj: users[req.session["userID"]],
      userURLs: userSpecificObj
    };
    res.render("urls_index", templateVars);
  }
});

// /URLS => comprehensive list of the user's URLs
app.post("/urls", (req, res) => {
  if (!req.session["userID"]) {
    res.status(401).send('Login to access page');

  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session["userID"]
    };
    res.redirect(`/urls/${shortURL}`);
  }
});


// /URLS/NEW => page to create a new short URL
app.get("/urls/new", (req, res) => {
  if (!req.session["userID"]) {
    res.redirect('/login');
  }

  const templateVars = {
    userObj: users[req.session["userID"]]
  };
  res.render("urls_new", templateVars);
});


// /U/:ID => redirection to the actual link
app.get("/u/:id", (req, res) => {
  if (!checkIfIdExists(req.params.id, urlDatabase)) {
    res.status(404).send('Cannot find the requested resource');

  } else if (!req.session["userID"]) {
    res.status(401).send('Login to access page');

  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
});

// /URLS/:ID => page for that specific link
app.get("/urls/:id", (req, res) => {
  if (!req.session["userID"]) {
    res.status(401).send('Login to access page');

  } else if (!(getURLsForUser(req.session["userID"], urlDatabase))[req.params.id]) {
    res.status(401).send('This URL does not belong to you');

  } else {
    const templateVars = {
      userObj: users[req.session["userID"]],
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  if (!req.params.id) {
    res.status(400).send('That short URL does not exist');

  } else if (!req.session["userID"]) {
    res.status(401).send('Login to access page');

  } else if (!(getURLsForUser(req.session["userID"], urlDatabase))[req.params.id]) {
    res.status(401).send('This URL does not belong to you');

  } else {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session["userID"]
    };

    res.redirect("/urls");
  }
});


// /URLS/:ID/DELETE 
app.post("/urls/:id/delete", (req, res) => {
  if (!req.params.id) {
    res.status(400).send('That short URL does not exist');

  } else if (!req.session["userID"]) {
    res.status(401).send('Login to access page');

  } else if (!(getURLsForUser(req.session["userID"], urlDatabase))[req.params.id]) {
    res.status(401).send('This URL does not belong to you');

  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
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