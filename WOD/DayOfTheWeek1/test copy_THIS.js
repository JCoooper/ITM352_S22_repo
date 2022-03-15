var day = 17;
var month = "january";
var year = 2000;

var monthKey = {
    january: 0,
    febuary: 3,
    march: 2,
    april: 5,
    may: 0,
    june: 3,
    july: 5,
    auguest: 1,
    september: 4,
    october: 6,
    november: 2,
    december: 4
  };

  const dayKey = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  var step1 = 0;
  var step2 = 0;
  var step3 = 0;
  var step4 = 0;
  var step5 = 0;
  var step6 = 0;


//step 1
if(month == "january" || month == "febuary") {
    step1 = year - 1;
} else {
    step1 = year;
}

console.log("step 1: " + step1);

//step 2
step2 = Math.floor(step1 / 4);
step1 = step1 + step2;

console.log("step 2: " + step2 +  " " + step1);

//step3
step3 = Math.floor(step1 / 100);
step2 = step2 - step3;

console.log("step 3: " + step3 + " " + step2);

//step4
step4 = Math.floor(step1 / 400);
step3 = step3 + step4;

console.log("step 4: " + step4 + " " + step3);

//step 5
step5 = step4 + day;
console.log("step 5: " + step5);

//step6
step6 = step5 + monthKey[month];
console.log("step 6: " + step6)

//step 7 
step7 = Math.floor(step5 % 7);
console.log("step 7: " + step7)

//out 
console.log(step7 + " " + dayKey[step7]);
