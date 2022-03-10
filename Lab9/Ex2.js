function isNotNegInt(q, returnErrors=false) { // checks to make sure the string coming in is a non-negative int
  errors = []; // assume no errors at first
  if (Number(q) != q) errors.push("Not a number!"); // Check if string is a number value
  if (q < 0) errors.push("Negative value!"); // Check if it is non-negative
  if (parseInt(q) != q) errors.push("Not an integer!"); // Check that it is an integer

  return returnErrors ? errors : (errors.length == 0);
}

var attributes = "Jordan;22;22.5;-21.5";
var parts_array = attributes.split(";");

for(let part of parts_array) {
    let errs = isNotNegInt(part, true);
    console.log(`Part ${part} isNotNegInt ${errs.join(',')}`);
}

/*
let show = function() {
  parts_array.forEach((item,index) => {} ) 
};
*/

function checkIt(item, index){
  console.log(`part ${index} is ${(isNotNegInt(item)?'a':'not a')} quantity`);
}


console.log(parts_array.forEach(checkIt()));
parts_array.forEeach((item,index) => {console.log(`part ${index} is ${(isNotNegInt(item)?'a':'not a')} quantity`);} ) 
//console.log(checkIt(parts_array));


function download(url, callback) {
  setTimeout(() => {
      // script to download the picture here
      console.log(`Downloading ${url} ...`);
      picture_data = "image data:XOXOXO";
  }, 3* 1000);
  callback(picture_data); 
}

function process(picture) {
  console.log(`Processing ${picture}`);
}

let url = 'https://www.example.comt/big_pic.jpg';
download(url, process); 
