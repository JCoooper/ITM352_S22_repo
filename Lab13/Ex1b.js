var filename = "./user_data.json";

const fs = require("fs");
if(fs.existsSync(filename)){
    let stats 
    console.log
    var data = fs.readFileSync(filename, 'utf-8');
    var users = JSON.parse(data);
    if(typeof users["kazman"] != 'undefined'){
        console.log(users["kazman"].password);
    }
} else {
    console.log(`${filename} does not exist!`);
}




//var users_reg_data = require("./user_data.json");
//console.log(users_reg_data[kazman].password);