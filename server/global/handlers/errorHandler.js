
const YoteError = require('../helpers/YoteError')

module.exports = (error, req, res, next) => {
  console.log("catching error in handler") 

  /**
   * goal here is unified error catching
   * 
   * if errors happen, just throw them and move on
   * let this determine what to send back
   * 
   * some misc
   * https://www.joyent.com/node-js/production/design/errors
   * 
   * for mongoose errors
   * https://mongoosejs.com/docs/api/error.html
   * 
   * other notes
   * https://www.npmjs.com/package/express-async-errors
   * 
   * http codes
   * https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/#h-handle-errors-gracefully-and-return-standard-error-codes
   */

  console.log("message", error.message)
  console.log("stack", error.stack)
  console.log("name", error.name)

  if(res.headersSent) {
    // an error thrown after a response has been sent (like on logout when mongo-connect is 'Unable to find a session to touch'), just log it and move on.
    console.log("error above came after response sent, moving on")
  } else if(error instanceof YoteError) {
    console.log("custom yote error")
    res.status(error.statusCode).send(error.message)
  } else {
    // send default "server 500" error
    res.status(500).send(error.message)
  }
};