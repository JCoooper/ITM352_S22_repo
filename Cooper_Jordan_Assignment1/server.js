var express = require('express');
var app = express();



// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available)
app.get('./purchase', function (request, response, next) {
   var q = request.body['product_form'];
   if(typeof q != 'undefined') {
       response.send(`Thank you for purchasing ${q} things!`);
   }
});

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));