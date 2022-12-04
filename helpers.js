const getUserByEmail = function(emailEntered, database) {
  for (let user in database) {
    if (database[user].email === emailEntered) {
      // console.log(database[user].userID);
      return database[user].userID;
    }
  }
};

module.exports = { getUserByEmail }