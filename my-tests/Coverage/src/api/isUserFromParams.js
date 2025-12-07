function isUserFromParams(params, loggedInUserId, loggedInUser) {
  if (!params.userId && !params.username && !params.user) {
    return true;
  }
  
  if (params.userId && params.userId !== '') {
    return params.userId === loggedInUserId;
  }
  
  if (params.username && params.username !== '') {
    return params.username === loggedInUser?.username;
  }
  
  if (params.user && params.user !== '') {
    return params.user === loggedInUser?.username;
  }
  
  return true;
}

module.exports = { isUserFromParams };
