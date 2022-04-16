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
const qs = require("querystring");
var urlstring; //var to store url string

// get items
var products_array = require(__dirname + "/products.json");

var express = require("express");
const req = require("express/lib/request");
var app = express();

//help from stackoverflow
app.use(express.urlencoded({
   extended: true
}));

// Routing

// monitor all requests
app.all("*", function(request, response, next) {
   console.log(request.method + " to " + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available)
app.post("/purchase", function(request, response, next) {
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
    //saves url string to be used in log in and reg functions
   if (isValidQuantity == true && hasValue == true) {
      urlstring = params;
       response.redirect("./login.html?" + params.toString());
   } else {
       response.redirect("./index.html?" + params.toString());
   }
});

//-----start I/O and set user data file
var filename = "./userdata.json";

const fs = require("fs");
const {
   url
} = require("inspector");
const {
   userInfo
} = require("os");
if (fs.existsSync(filename)) {
   //check
   let stats = fs.statSync(filename);
   //console.log(`${filename} has ${stats.size} characters`); // tell how many chars are in file
   var data = fs.readFileSync(filename, "utf-8");
   var users = JSON.parse(data);
   if (typeof users["test@test.com"] != "undefined") {
       console.log("[---User file is correct and has at least test user data---]");
   }
} else {
   console.log(`${filename} does not exist!`);
} //-----------------

//----------------------------------LOG IN------------------------------
app.post("/login", function(request, response) {
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
       if (
           users[request.body.email.toLowerCase()].password == request.body.password
       ) {
           if (urlstring == undefined) {
               //prevents going to invoice with no values
               response.redirect("./index.html");
           } else {
               response.redirect("./invoice.html?" + urlstring + "&name=" + users[request.body.email.toLowerCase()].name);
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
app.post("/register", function(request, response) {
   // process a simple register form
   console.log(request.body);
   //let email = request.body.email;
   //let name = request.body["name"];
   var errorcount = 0;
   var errorarray = {};
   errorarray["name"] = [];
   errorarray["email"] = [];
   errorarray["password"] = [];
   errorarray["password2"] = [];

   // Check to see if email has correct chars
   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email) == false) {
       errorarray["email"].push("Email is not valid");
       errorcount++;
   }

   //Check to see if email is taken
   if (typeof users[request.body["email"].toLowerCase()] != "undefined") {
       errorarray["email"].push("Email is already taken");
       errorcount++;
   }

   //check to see if name has correct chars and if taken or not
   if (typeof request.body.name != "undefined") {
       if (/^[A-Za-z ]+$/.test(request.body.name) == false) {
           errorarray["name"].push("Name is not valid");
           errorcount++;
       }
   } else {
       errorarray["name"].push("Please enter a name");
       errorcount++;
   }

   //check to see if name is less than 30 chars
   if (request.body.name.length > 30) {
       errorarray["name"].push("Name must be less than 30 characters");
       errorcount++;
   }

   //check to see if password has 8 chars
   if (request.body.password.length < 8) {
       errorarray["password"].push(
           "Password needs to be at least 8 characters long"
       );
       errorcount++;
   }
   //check if passwords match
   if (request.body.password !== request.body.repeat_password) {
       errorarray["password2"].push("Passwords do not match");
       errorcount++;
   }
   console.log(errorarray);
   console.log("Number of Errors: " + errorcount);

   let params = new URLSearchParams(request.query);

   if (errorcount == 0) {
       users[request.body["email"].toLowerCase()] = {};
       users[request.body["email"].toLowerCase()].name = request.body.name;
       users[request.body["email"].toLowerCase()].password = request.body.password;

       fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

       params.append("email", request.body.email);
       response.redirect("./invoice.html?" + urlstring + "&name=" + users[request.body.email.toLowerCase()].name);
       return;
   } else {
       request.body.errorarray = JSON.stringify(errorarray);
       response.redirect(
           `./register.html?` + qs.stringify(request.body) + "&" + urlstring
       );
   }
});
//-------------------------------------------------------------------------------
//-------------------------------edit info---------------------------------------
app.post("/editaccount", function(request, response) {
   var errorarray = {};
   errorarray["name"] = [];
   errorarray["email"] = [];
   errorarray["password"] = [];
   errorarray["password2"] = [];
   var errorcount = 0;

   if (typeof users[request.body["email"].toLowerCase()] != "undefined") {
       //Check to see if passwords match
       if (users[request.body['email'].toLowerCase()].password == request.body.oldpassword) {
           //check to see if password has 8 chars
           if (request.body.newpassword.length < 8) {
               errorarray["password"].push("Password needs to be at least 8 characters long");
               errorcount++;
           }
           //check if passwords match
           if (request.body.newpassword !== request.body.repeatnewpassword) {
            console.log(request.body);
            console.log(users[request.body['email'].toLowerCase()].password);
               errorarray["password2"].push("Passwords do not match");
               errorcount++;
           }

           console.log(errorarray);
           console.log("Number of Errors: " + errorcount);

           let params = new URLSearchParams(request.query);
           if (errorcount == 0) {
               users[request.body["email"].toLowerCase()].password =
                   request.body.newpassword;

               fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

               params.append("email", request.body.email);
               response.redirect("./invoice.html?" + urlstring + "&name=" + users[request.body.email.toLowerCase()].name);
               return;
           }
       } else {
         console.log(request.body);
         console.log(users[request.body['email'].toLowerCase()].password);
           errorarray["password"].push("Password Incorrect");
           errorcount++;
       }
   } else {
       errorarray["email"].push(`${request.body.email} does not exist`);
       errorcount++;
   }
   console.log(errorarray);
   console.log("Number of Errors: " + errorcount);

   request.query["email"] = request.body["email"].toLowerCase();
   request.query["errors"] = errorarray;
   response.redirect(`./editaccount.html?` + "wronglogin" +qs.stringify(request.body) + "&" + urlstring);
});
//-------------------------------------------------------------------------------

// route all other GET requests to files in public
app.use(express.static(__dirname + "/public"));

// start server
app.listen(8080, () => console.log(`correct: listening on port 8080`));