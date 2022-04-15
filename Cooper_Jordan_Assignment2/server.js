//-- Functions --
function isNonNegInt(q, returnerrors = false) {
  errors = []; // assume no errors at first
  if (q == "") {
    q = 0; // handle blank inputs as if they are 0, help from assignment 1 example
  }
  if (Number(q) != q) {
    errors.push("Not a number!"); // Check if string is a number value
  } else if (q < 0) {
    errors.push("Negative value!"); // Check if it is non-negative
  } else if (parseInt(q) != q) {
    errors.push("Not an integer!"); // Check that it is an integer
  }
  return returnerrors ? errors : errors.length == 0;
}
//-- End of functions --

var urlstring; //var to store url string

// get items
var products_array = require(__dirname + "/products.json");

const qs = require('querystring');
var express = require("express");
const req = require("express/lib/request");
var app = express();

//help from stackoverflow
app.use(express.urlencoded({ extended: true }));

// Routing

// monitor all requests
app.all("*", function (request, response, next) {
  console.log(request.method + " to " + request.path);
  next();
});

// process purchase request (validate quantities, check quantity available)
app.post("/purchase", function (request, response, next) {
  //set defaults
  var hasValue = false;
  var isValidQuantity = true;

  for (i = 0; i < products_array.length; i++) {
    var inputValue = request.body[`quantity${i}`];
    if (!isNonNegInt(inputValue)) {
      // if it is not a negative int set isValidQuantity to false
      isValidQuantity = false;
    }

    //Check if a quantity is greater than 0
    if (inputValue > 0) {
      hasValue = true;
    }

    if (inputValue > products_array[i].quantity) {
      isValidQuantity = false;
    }
  }

  // redirect to invoice and store quantities in query string
  let params = new URLSearchParams(request.body);
  urlstring = params; //saves url string to be used in log in and reg functions
  if (isValidQuantity == true && hasValue == true) {
    response.redirect("./login.html?" + params.toString());
  } else {
    response.redirect("./index.html?" + params.toString());
  }
});

//-----start I/O and set user data file
var filename = "./userdata.json";

const fs = require("fs");
const { url } = require("inspector");
const { userInfo } = require("os");
if (fs.existsSync(filename)) {
  //check
  let stats = fs.statSync(filename);
  //console.log(`${filename} has ${stats.size} characters`); // tell how many chars are in file
  var data = fs.readFileSync(filename, "utf-8");
  var users = JSON.parse(data);
  if (typeof users["test"] != "undefined") {
    console.log("[---User file is correct and has at least test user data---]");
  }
} else {
  console.log(`${filename} does not exist!`);
} //-----------------

//----------------------------------LOG IN------------------------------
app.post("/login", function (request, response) {
  //----log in post-----

  //----check to see if there is a url string
  var hasValue = false;
  var isValidQuantity = true;

  for (i = 0; i < products_array.length; i++) {
    var inputValue = request.body[`quantity${i}`];
    if (!isNonNegInt(inputValue)) {
      // if it is not a negative int set isValidQuantity to false
      isValidQuantity = false;
    }

    //Check if a quantity is greater than 0
    if (inputValue > 0) {
      hasValue = true;
    }

    if (inputValue > products_array[i].quantity) {
      isValidQuantity = false;
    }
  }
  //---------

  // main log in functionality
  console.log(request.body);

  var loginerror = "";

  // Process login form POST and redirect to logged in page if ok, back to login page if not
  if (typeof users[request.body.email.toLowerCase()] != "undefined") {
    //username exits so get stored pass and check if it matches password enterd    /* weirdly i cannot do request.body[password], fig out
    let params = new URLSearchParams(request.body);
    if (users[request.body.email.toLowerCase()].password == request.body.password) {
      if (urlstring == undefined) { //prevents going to invoice with no values
        response.redirect("./index.html");
      } else {
        response.redirect("./invoice.html?" + urlstring);
        console.log(urlstring);
      }
    } else {
      loginerror = "Error";
    }
  } else {
    loginerror = "Error";
  }

  response.redirect("./login.html?" + urlstring + "&loginerror=" + loginerror);
});

//-------------------------------------------------------------------------------

//----------------------------Register-------------------------------------------
app.post("/register", function (request, response) {
  // process a simple register form
  console.log(request.body);
  let email = request.body.email;
  let name = request.query['name'];
  users[email] = {};
  users[email].password = request.body.password;
  users[email].repeat_password = request.body.repeat_password;
  users[email].email = request.body.email;

  var errorarray = {};
  errorarray['name'] = [];
  errorarray['email'] = [];
  errorarray['password'] = [];
  errorarray['password2'] = [];

    // Check to see if email has correct chars
    if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email) == false) {
       errorarray['email'].push("Email is not valid");
    } 

    //Check to see if email is taken
    if(typeof users[request.body['email'].toLowerCase()] != "undefined"){
      errorarray['email'].push("Email is already taken");
    }

    //check to see if name has correct chars
    if(typeof name != "undefined"){
       if(/^[A-Za-z ]+$/.test(request.body.name) == false) {
         errorarray['name'].push("Name is not valid");
       }
    } else {
      errorarray['name'].push("Please enter a name");
    }

    //check to see if password has 8 chars
    if(request.body.password.length < 8){
      errorarray['password'].push("Password needs to be at least 8 characters long");
    }

    if (request.body.password !== request.body.repeat_password) {
      errorarray['password2'].push("Passwords do not match");
    }
     console.log(errorarray);

    let params = new URLSearchParams(request.body);

    if(JSON.stringify(errorarray) == "{}"){
      users[email] = {};
      users[email].name = request.body.name;
      users[email].password = request.body.new_password;

      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      response.redirect('./invoice.html?' + params.toString());
      return;
    } /*else {
      request.query['email'] = email;
      request.query['name'] = name;
      request.query['errors'] = errorarray;
      response.redirect(`./register.html?` + qs.stringify(request.query));
    }*/

});
//-------------------------------------------------------------------------------

// route all other GET requests to files in public
app.use(express.static(__dirname + "/public"));

// start server
app.listen(8080, () => console.log(`correct: listening on port 8080`));
