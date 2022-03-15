var amount = 918;

var quaters = 0;
var dimes = 0;
var nickles = 0;
var pennies = 0;

quaters = Math.floor(amount / 25); //quaters
amount = amount % 25;

if(amount >= 10){
    dimes = Math.floor(amount / 10); //dimes
    amount = amount % 10;
}

if(amount >= 5){
    nickles = Math.floor(amount / 5); //nickles
    amount = amount % 5;
}

if(amount >= 1){
    pennies = Math.floor(amount / 1); //pennies
    amount = amount % 1;
}

console.log("Quaters: " + quaters);
console.log("Dimes:   " + dimes);
console.log("Nickles: " + nickles);
console.log("Pennies: " + pennies);

