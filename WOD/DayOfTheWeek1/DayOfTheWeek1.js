var day = 26;
var month = "march";
var year = 2013;

var monthKey = {
    january: 0,
    february: 3,
    march: 2,
    april: 5,
    may: 0,
    june: 3,
    july: 5,
    august: 1,
    september: 4,
    october: 6,
    november: 2,
    december: 4
};

const dayKey =  ['Sunday', 'Monday' , 'Tuesday' , 'Wednesday' , 'Thursday' , 'Friday' , 'Saturday'];

//step 1
if(month == "January" || month == "Feburary") {
    step1 = year - 1;
} else {
    step1 = year;
}

//step 2
step2 = step1 + Math.floor(step1/4);

//step 3
step3 = step2 - Math.floor(step1/100);

//step 4
step4 = step3 + Math.floor(step1/400);

//step 5
step5 = step4 + day;

//step 6
step6 = step5 + monthKey[month];

//step 7
step7 = step6 % 7;
console.log(step7);

//out
console.log(`On ${month} ${day} in ${year} it was a ${dayKey[step7]}`);