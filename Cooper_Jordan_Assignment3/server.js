// !-- By: Jordan Cooper, File Use: This is the server file responsible for server side functions and calls --!
//-- Functions --
//help from professor port, sean sumida and john ho
//from lab 12
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

//import packs
var session = require("express-session");
var express = require("express");
var nodemailer = require("nodemailer");
var app = express();
var cookieParser = require("cookie-parser");

const req = require("express/lib/request");

app.use(
  session({
    secret: "MySecretKey",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 },
  })
);
app.use(cookieParser());

//help from stackoverflow
app.use(express.urlencoded({ extended: true }));

// Help from prof port
// monitor all requests
app.all("*", function (request, response, next) {
  console.log(request.method + " to " + request.path);
  if (typeof request.session.cart == "undefined") {
    request.session.cart = new Array(products_array.length).fill(0);
    console.log(request.session.cart);
  }
  // request.session.current_url = ''
  next();
});

// Help from prof port
app.get("*", function (request, response, next) {
  if (
    request.path.includes("cart.html") == true ||
    request.path.includes("index.html") == true
  ) {
    request.session.lastPage = request.originalUrl;
  }
  next();
});

// Help from prof port
app.post("/productData", function (request, response, next) {
  response.json(products_array);
});

// Help from prof port
app.get("/logout", function (request, response, next) {
  request.session.loginID = undefined;
  response.redirect("back");
});

// Help from prof port
app.post("/cartData", function (request, response, next) {
  response.json(request.session.cart);
});

// Help from prof port
app.post("/getUserInfo", function (request, response, next) {
  if (typeof request.session.loginID == "undefined") {
    response.json({ email: undefined, name: undefined });
  } else {
    response.json({
      email: request.session.loginID,
      name: users[request.session.loginID].name,
    });
  }
});
// Help from prof port
app.post("/updateCart", function (request, response, next) {
  console.log(request.query);
  var prodIndex = request.query.pindex;
  var qty = request.query.qty;

  request.session.cart[prodIndex] = qty;
  response.json(request.session.cart);
  console.log(request.session);
});

//-----start I/O and set user data file
var filename = "./userdata.json";

const fs = require("fs");
const { url } = require("inspector");
const { userInfo } = require("os");
if (fs.existsSync(filename)) {
  let stats = fs.statSync(filename);
  var data = fs.readFileSync(filename, "utf-8");
  var users = JSON.parse(data);
  if (typeof users["test@test.com"] != "undefined") {
    console.log("[---User file is correct and has at least test user data---]");
  }
} else {
  console.log(`${filename} does not exist!`);
} //---------------------------------------

//--------------------------------INVOICE EMAIL------------------------
//help from code exmaples on class site
app.get("/checkout", function (request, response, next) {
  // Generate HTML invoice string
  var title_str = `<p style="font-size: 20px;" >Thank you for your order ${users[request.session.loginID].name}!</p><br><table border><th>Item</th><th>Quantity</th><th>Price</th><th>Extended Price</th>`;
  var shopping_cart = request.session.cart;
  var invoice_str = `<a href="index.html" class="w3-button"><b>Jewels Co.</a>`;

  var taxrate = 5.57; // tax rate

  /* initialize vars */
  var subtotal = 0;
  var taxamount = 0;
  var extended_price = 0;
  var shippingamount = 0;
  for (var i in shopping_cart) {
    if (shopping_cart[i] > 0) {
      extended_price = products_array[i].price * shopping_cart[i];
      subtotal = subtotal + extended_price;
      taxamount = subtotal / taxrate;
      grandtotal = subtotal + taxamount;
      if (subtotal <= 50) {
        shippingamount = 2;
      } else if (subtotal > 50 && subtotal <= 100) {
        shippingamount = 5;
      } else {
        shippingamount = (subtotal / 100) * 5;
      }
      grandtotal = grandtotal + shippingamount;
      title_str += `<tr><td style="text-align: center; padding: 15px;">${products_array[i].name}</td><td style="text-align: center;">${shopping_cart[i]}</td><td>$${products_array[i].price.toFixed(2)}</td><td style="text-align: center; padding-center: 25px;">$${extended_price.toFixed(2)}</td></tr>`;
    }
  }
  
  title_str += `
  </table>
  <br>
  <table border style="border-collapse: collapse;"><th> Sub-Total:</th><th>Tax @ a ${taxrate}% rate: </th><th>Shipping:</th>
  <tr>
  <td style="text-align: center;">$${subtotal.toFixed(2)}</td>
  <td style="text-align: center;">$${taxamount.toFixed(2)}</td>
  <td style="text-align: center;">$${shippingamount.toFixed(2)}</td>
  </tr>
  </table>
  <p style="font-weight: bold; font-size: 15px; text-decoration: underline;">Total: $${grandtotal.toFixed(2)}</p>
  `;

  // Set up mail server. Only will work on UH Network due to security restrictions
  var transporter = nodemailer.createTransport({
    host: "mail.hawaii.edu",
    port: 25,
    secure: false, // use TLS
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  var user_email = request.session.loginID;
  var mailOptions = {
    from: "jcooper2@hawaii.edu",
    to: user_email,
    subject: "Receipt For Your Order At Jewels Co.",
    html: title_str,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      title_str +=`<br><p>There was an error and your invoice could not be emailed :( </p><a href="index.html" class="w3-button"><b>Click Here To Go To Home Page!</a>`;
    } else {
      title_str += `<br><p>Your invoice was mailed to ${user_email}</p><a href="index.html" class="w3-button"><b>Click Here To Go To Home Page!</a>`;
      request.session.cart = undefined; //clear cart after transaction 
    }
    response.send(title_str);
  });
});

//---------------------------------------------------------------------

//----------------------------------LOG IN------------------------------

app.post("/login", function (request, response) {
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

    if (inputValue > products_array[i].quantity_available) {
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
      //help from prof port
      //log in sucsess put email into session to note they logged in, then send to index
      request.session.loginID = request.body.email.toLowerCase(); // to log out need to delete or make undefined
      response.redirect(request.session.lastPage); //same for reg
      return;
    } else {
      loginerror = "Error: Bad Password";
    }
  } else {
    loginerror = "Error: Bad Email";
  }

  response.redirect("./login.html?" + urlstring + "&loginerror=" + loginerror); //giving error
});

app.get("/invoice", function (request, response, next) {///iffy
    if (typeof request.session.cart == "undefined") {
      response.redirect("./index.html");
      return;
    }
    next();
});

//help from prof port
app.get("/invoice.html", function (request, response, next) {
    if (typeof request.session.loginID == "undefined") {
        response.redirect("./login.html");
        return;
      }

      var chopcart = request.session.cart;
      var total = 0;
      for (let i in chopcart) {
          total += Number(chopcart[i]);
      }
        if(total == 0){
            console.log("Total Items In Cart: " + total);
            response.redirect(request.session.lastPage);
            return;
        }
    

  next();
});
//-------------------------------------------------------------------------------

//----------------------------Register-------------------------------------------
app.post("/register", function (request, response) {
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

  // Check to see if email has correct chars, help from sean sumida
  if (
    /^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email) ==
    false
  ) {
    errorarray["email"].push("Email is not valid");
    errorcount++;
  }

  //Check to see if email is taken
  if (typeof users[request.body["email"].toLowerCase()] != "undefined") {
    errorarray["email"].push("Email is already taken");
    errorcount++;
  }

  //check to see if name has correct chars and if taken or not, help from sean sumida
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

  //inspiration from john
  if (errorcount == 0) {
    users[request.body["email"].toLowerCase()] = {};
    users[request.body["email"].toLowerCase()].name = request.body.name;
    users[request.body["email"].toLowerCase()].password = request.body.password;

    fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

    params.append("email", request.body.email);
    response.redirect(request.session.lastPage);
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
app.post("/editaccount", function (request, response) {
  var errorarray = {};
  errorarray["name"] = [];
  errorarray["email"] = [];
  errorarray["password"] = [];
  errorarray["password2"] = [];
  var errorcount = 0;

  if (typeof users[request.body["email"].toLowerCase()] != "undefined") {
    //Check to see if passwords match
    if (
      users[request.body["email"].toLowerCase()].password ==
      request.body.oldpassword
    ) {
      //check to see if password has 8 chars
      if (request.body.newpassword.length < 8) {
        errorarray["password"].push(
          "Password needs to be at least 8 characters long"
        );
        errorcount++;
      }
      //check if passwords match
      if (request.body.newpassword !== request.body.repeatnewpassword) {
        console.log(request.body);
        console.log(users[request.body["email"].toLowerCase()].password);
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
        response.redirect(
          "./invoice.html?" +
            urlstring +
            "&name=" +
            users[request.body.email.toLowerCase()].name
        );
        return;
      }
    } else {
      console.log(request.body);
      console.log(users[request.body["email"].toLowerCase()].password);
      errorarray["password"].push("Password Incorrect");
      errorcount++;
    }
  } else {
    errorarray["email"].push(`${request.body.email} does not exist`);
    errorcount++;
  }
  console.log(errorarray);
  console.log("Number of Errors: " + errorcount);
  //help from sean sumida
  request.query["email"] = request.body["email"].toLowerCase();
  request.query["errors"] = errorarray;
  response.redirect(
    `./editaccount.html?` +
      "wronglogin" +
      qs.stringify(request.body) +
      "&" +
      urlstring
  );
});
//-------------------------------------------------------------------------------

// route all other GET requests to files in public
app.use(express.static(__dirname + "/public"));

// start server
app.listen(8080, () => console.log(`correct: listening on port 8080`));
