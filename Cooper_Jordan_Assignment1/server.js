function isNonNegInt(q, returnerrors = false) {
   errors = []; // assume no errors at first
   if (q == '') {
       q = 0; // handle blank inputs as if they are 0, help from assignment 1 example
   }
   if (Number(q) != q) {
       errors.push("Not a number!"); // Check if string is a number value
   } else if (q < 0) {
       errors.push("Negative value!"); // Check if it is non-negative
   } else if (parseInt(q) != q) {
       errors.push("Not an integer!"); // Check that it is an integer
   }
   return returnerrors ? errors : (errors.length == 0);
} 

// get items
var products_array = require(__dirname + '/products.json');

var express = require('express');
var app = express();

//help from stackoverflow
app.use(express.urlencoded({extended: true}))

// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available)
app.post("/purchase", function (request, response, next) {
   //set defaults 
   var hasValue = false; 
   var isValidQuantity = true; 

   for (i = 0; i < products_array.length; i++){
      var inputValue = request.body[`quantity${i}`]; 
     if (!isNonNegInt(inputValue)){ // if it is not a negative int set isValidQuantity to false
        isValidQuantity = false; 
     }

   //Check if a quantity is greater than 0
   if (inputValue > 0){
      hasValue = true;
   }
  
     if(inputValue > products_array[i].quantity){ 
        isValidQuantity = false;
     }
   }

   // redirect to invoice and store quantities in query string 
  let params = new URLSearchParams(request.body);
  if(isValidQuantity == true && hasValue == true) {
     response.redirect('./invoice.html?'+ params.toString());
  } else {
     response.redirect('./index.html?'+ params.toString());
  }
});

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));