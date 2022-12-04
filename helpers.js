const getUserByEmail = function(emailEntered, database) {
  for (let user in database) {
    if (database[user].email === emailEntered) {
      return database[user].userID;
    }
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 9);
};

const checkUserPassword = function(emailEntered, passwordEntered, database) {
  for (let user in database) {
    if (database[user].email === emailEntered) {
      return bcrypt.compareSync(passwordEntered, database[user].hashedPassword);
    }
  }
};

const getUserID = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
};

const checkIfIdExists = function(id, database) {
  for (let key in database) {
    if (id === key) {
      return true;
    }
  }
  return false;
};

const getURLsForUser = function(id, database) {
  let filteredURLs = {};
  for (let key in database) {
    if (database[key].userID === id) {
      filteredURLs[key] = database[key];
    }
  }
  return filteredURLs;
};


module.exports = { getUserByEmail, generateRandomString, checkUserPassword, getUserID, checkIfIdExists, getURLsForUser };