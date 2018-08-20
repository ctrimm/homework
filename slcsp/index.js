const fs = require('fs');

const plansFile = 'plans.csv';
const slcspFile = 'slcsp.csv';
const zipsFile = 'zips.csv';

var plansData = [];
var slcspData = [];
var zipsData = [];

var finalSLCSPOutputData = 'zipcode,rate\n';

// This will hold all the plans per state
let uniqueStatePlans = [];

// This will hold all the unique states from the plans.csv file
let uniqueStatesCount = [];

// This will hold all of the unique zip codes in the zips.csv file
let uniqueZips = [];

// NOTE - This approach utilizes streams to read the file(s)
// After reading into this, I fond out that streams read files
// nearly 4x faster than `readFile(file, 'utf8');`
// This should allow for the zips/plans/slcsp.csv files to grow
// to a much larger size without adversely affecting performance.

/**
 * Loads the plans.csv file into the [plansData]
 * @param {string} file Path to the plans.csv file (defined above)
 */
async function loadPlans(file) {
    return new Promise(resolve => {
        const label = `Reading - ${file}`;
        console.time(label);
        const stream = fs.createReadStream(file, {encoding: 'utf8'});

        // Handle any errors while reading
        stream.on('error', err => (console.log('THERE WAS AN ERROR', err)));

        stream.on('data', data => {
            var lines = data.split(/\r?\n/g);

            // Place data into plansData
            for(var i = 1; i < lines.length; i++) {
                var individualPlanRow = lines[i].split(/[,]/g);
                var plan_id = individualPlanRow[0];
                var state = individualPlanRow[1];
                var metal_level = individualPlanRow[2];
                var rate = individualPlanRow[3];
                var rate_area = individualPlanRow[4];

                plansData.push({ plan_id, state, metal_level, rate, rate_area});
            }
        });

        stream.on('close', () => (console.timeEnd(label), resolve()));
    });
}

/**
 * Loads the zips.csv file into the [zipsData]
 * @param {string} file Path to the zips.csv file (defined above)
 */
async function loadZips(file) {
    return new Promise(resolve => {
        const label = `Reading - ${file}`;
        console.time(label);
        const stream = fs.createReadStream(file, {encoding: 'utf8'});

        // Handle any errors while reading
        stream.on('error', err => (console.log('THERE WAS AN ERROR', err)));

        stream.on('data', data => {
            var lines = data.split(/\r?\n/g);

            // Place data into zipsData
            for(var i = 1; i < lines.length; i++) {
                var individualZipRow = lines[i].split(/[,]/g);
                var zipcode = individualZipRow[0];
                var state = individualZipRow[1];
                var county_code = individualZipRow[2];
                var name = individualZipRow[3];
                var rate_area = individualZipRow[4];

                zipsData.push({ zipcode, state, county_code, name, rate_area});
            }
        });

        stream.on('close', () => (console.timeEnd(label), resolve()));
    });
}

/**
 * Loads the sclsp.csv file into the [slcspData]
 * @param {string} file Path to the sclsp.csv file (defined above)
 */
async function loadSLCSPs(file) {
    return new Promise(resolve => {
        const label = `Reading - ${file}`;
        console.time(label);
        const stream = fs.createReadStream(file, {encoding: 'utf8'});

        // Handle any errors while reading
        stream.on('error', err => (console.log('THERE WAS AN ERROR', err)));

        stream.on('data', data => {
            var lines = data.split(/\r?\n/g);

            // Place data into slcspData
            for(var i = 0; i < lines.length; i++) {
                var individualSCLSPRow = lines[i].split(/[,]/g);
                var zipcode = individualSCLSPRow[0];
                var rate = individualSCLSPRow[1];

                slcspData.push({ zipcode, rate});
            }
        });

        stream.on('close', () => (console.timeEnd(label), resolve()));
    });
}

/**
 * Maniputlates the [plansData] into a much nicer data format
 */
async function manipulatePlansData() {
    var ratePlanArray = [];
    var ratePlanCounts = [];
    var rateMultiples = [];

    for(var i = 1; i < plansData.length; i++) {
        var plan_id = plansData[i].plan_id;
        var state = plansData[i].state;
        var metal_level = plansData[i].metal_level;
        var rate = plansData[i].rate;
        var rate_area = plansData[i].rate_area;

        if(!ratePlanCounts[state+metal_level+rate_area] ) {
            ratePlanArray[state+metal_level+rate_area] = [{ rate, plan_id }];
            ratePlanCounts[state+metal_level+rate_area] = { state, metal_level, rate_plans: ratePlanArray[state+metal_level+rate_area], rate_area };
        } else {
            ratePlanArray[state+metal_level+rate_area].push({ rate, plan_id });
            ratePlanCounts[state+metal_level+rate_area] = { state, metal_level, rate_plans: ratePlanArray[state+metal_level+rate_area], rate_area };
        }

        // sort the ratePlanArray by rate
        ratePlanArray[state+metal_level+rate_area].sort(function(a, b) {
            return ((a.rate < b.rate) ? -1 : ((a.rate == b.rate) ? 0 : 1));
        });

        rateMultiples[state+metal_level+rate_area] = ratePlanCounts[state+metal_level+rate_area];

        uniqueStatePlans.push(rateMultiples[state+metal_level+rate_area]);
    }
}

/**
 * Manipulates the [zipsData] into a nicer data format.
 * It creates an object {uniqueZips} with a key of each zip code
 * sample - '07063': { zipcode: '07063',
 *          state: 'NJ',
 *          county_code: [ '34035', '34039' ],
 *          name: [ 'Somerset', 'Union' ],
 *          rate_plans: [ '1', '1' ] },
 */
async function manipulateZipsData() {
    var zipCounts = [];
    var zipMultiples = [];
    var countyArray = [];
    var countyCodeArray = [];
    var ratePlanArray = [];

    for(var i = 1; i < zipsData.length; i++) {
        var zipcode = zipsData[i].zipcode;
        var state = zipsData[i].state;
        var county_code = zipsData[i].county_code;
        var name = zipsData[i].name;
        var rate_area = zipsData[i].rate_area;

        // Some logic to create a zipMultiples/uniqueZips object for easier lookups later on.
        if (!zipCounts[zipcode]) {
            countyArray[zipcode] = [name];
            countyCodeArray[zipcode] = [county_code];
            ratePlanArray[zipcode] = [rate_area];
            zipCounts[zipcode] = { zipcode, state, county_code: countyCodeArray[zipcode], name: countyArray[zipcode],  rate_plans: ratePlanArray[zipcode] };
            zipMultiples[zipcode] = zipCounts[zipcode];
        } else {
            countyArray[zipcode].push(name);
            countyCodeArray[zipcode].push(county_code);
            ratePlanArray[zipcode].push(rate_area);
            zipCounts[zipcode] = { zipcode, state, county_code: countyCodeArray[zipcode], name: countyArray[zipcode],  rate_plans: ratePlanArray[zipcode] }
            zipMultiples[zipcode] = zipCounts[zipcode];
        }
    }
    uniqueZips = zipMultiples;
}

/**
 * Find unique States & store into a global variable [uniqueStatesCount]
 * This allows for faster lookup later during execution
 */
async function generateUniqueStates() {
    var stateCounts = [];
    var stateMultiples = [];

    for(var i = 1; i < plansData.length; i++) {
        var state = plansData[i].state;

        // Some logic to create a small stateMultiples array for easier lookups later on.
        if (!stateCounts[state]) {
            stateCounts[state] = 1;
        } else {
            stateCounts[state]++;
            stateMultiples[state] = stateCounts[state];
        }
    }
    uniqueStatesCount = stateMultiples;
}

/**
 * Look up various plan information based on ZIP Code
 * @param {Integer} zipcode ZIP Code Value
 * @return {Boolean/Object} Dependant on if the State Associate with the ZIP Code exists in the [uniqueStatesCount]
 */
async function lookupPlanInfoBasedOnZip(zipcode) {
    if(uniqueZips[zipcode] == undefined) {
        return false;
    }

    for (var i = 1; i < uniqueZips.length; i++) {
        // ensure that the zip code has 1 rate_plan per requirements
        hasUniqueRatePlans = uniqueZips[zipcode].rate_plans.every((value, _, array) => (array[0] === value));

        // If zipcode is in uniqueZips & has uniqueRatePlans, check to see if it is in uniqueStatesCount.
        if (uniqueZips[zipcode].zipcode == zipcode && hasUniqueRatePlans) {
            // Check to see if the state exists in the uniqueStateCount object
            if ( !(uniqueZips[zipcode].state in uniqueStatesCount)) {
                return false;
            } else {
                return uniqueZips[zipcode];
            }
        } else if (uniqueZips[zipcode].zipcode == zipcode && !hasUniqueRatePlans) {
            return false;
        }
    }
}

// Iterate over each zip code ^^
// If ZIP has > 1 rate_plan, do nothing to the file.
// If the ZIP.state ! inside of the uniqueStatePlans array, do nothing to the file.
// If the ZIP only has 1 Silver plan, do nothing
// Else, get the 2nd lowest Silver Plan, plan_id

/**
 * Iterate over each zip code from the [slcspData] and update the finalSLCSPOutputData String
 */
async function processData() {
    for (var i = 1; i < slcspData.length; i++) {
        let slcspInputZipCode = slcspData[i].zipcode;

        if(slcspData[i] == undefined || slcspInputZipCode == '') {
            // do nothing
            finalSLCSPOutputData += slcspInputZipCode + ',\n';
        } else {
            results = await lookupPlanInfoBasedOnZip(slcspInputZipCode);
            if(!results) {
                finalSLCSPOutputData += slcspInputZipCode + ',\n';
            } else {
                await lookupSLCSP(results);
            }

        }
    }
}

/**
 * Lookup Second Lowest Cost Silver Plan based on zipInfo argument
 * @param {Object} zipInfo
 * @returns {} Return early if everything matches
 */
async function lookupSLCSP(zipInfo) {
    for (var i = 1; i < uniqueStatePlans.length; i++) {
        if(uniqueStatePlans[i].metal_level == 'Silver' && uniqueStatePlans[i].state == zipInfo.state && uniqueStatePlans[i].rate_area == zipInfo.rate_plans[0] ) {
            // Also have to make sure we get the 2nd unique plan cost, not just the 2nd item in the array
            // this is because for 26716 ZIP code, there are 2 plans with the same price.
            finalSLCSPOutputData += zipInfo.zipcode + ',' + uniqueStatePlans[i].rate_plans[1].rate + '\n';
            return;
        }
    }
}

/**
 * Take the finalSLCSPOutputData and write it to the slcsp_answer.csv file.
 */
function exportCSV() {
    fs.writeFile("slcsp_answer.csv", finalSLCSPOutputData, (err) => {
        if(err) throw err;
    });
}

async function start() {
    await loadPlans(plansFile);
    await loadZips(zipsFile);
    await loadSLCSPs(slcspFile);

    await manipulatePlansData();
    await manipulateZipsData();
    await generateUniqueStates();

    await processData();
    await exportCSV();
}

start();
