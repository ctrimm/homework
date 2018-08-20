const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
// import our getIndexPage function
const index = require('../index.js');

describe("index.js -> start()", function() {
    it("should return index", function() {
        console.log('hello 0 ', index.start);
        expect(index.start.calledOnce).to.be.true
    });
});

// VARIOUS TEST CASES -
// (Ran out of time)

// 1. If slcsp zip code is undefined, ensure that nothing is written to output file

// 2. If a zip code has >1 rate_are, ensure that nothing is written to the output file

// 3. If the state associated with a zip code is not in the plans.csv file, ensure that nothing is written to the output file

// 4. If there is only 1 Silver plan in a rate_area, ensure that nothing is written to the output file

// 5. If the rates for a particular zip are [ 120.50, 248.71, 473.8, 120.50]
//    Ensure that the Second Lowest Cost Silver Plan is `248.71`

// 6. Ensure that the input and output SLCSP files are in the same order
