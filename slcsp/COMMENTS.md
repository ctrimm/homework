# SLCSP Take Home Assignment

The [SLCSP Take Home Assignment](https://github.com/adhocteam/homework/tree/master/slcsp) - determine the second lowest cost silver plan (SLCSP) for
a group of ZIP Codes.

## Dev Setup

Pre-requisites (Assuming Mac OS X Development Environment):

* [nvm installed](https://github.com/creationix/nvm#installation) (>0.33.8)
* [node installed](https://nodejs.org/en/) (Preferably 9.3.0, also works on 8.10.0)
* [npm installed](https://docs.npmjs.com/cli/install) (>6.3.0)

Steps:

1. Once all pre-requisites are installed, run `npm install` to install a couple dependencies
2. Once dependencies are installed, run `node index.js` to generate the `slcsp_answer.csv` file.
3. To run the test suite `npm test`

### Testing Framework & Libraries

Having a minimal amount of time remaining, I wound up installing mocha, chai, & Sinon to help create mocks,
stubs, etc... Unfortunately, I did not have time to implement test coverage since I did not take a TDD approach.
You can view all of the other test cases I wanted to test in the `test/index.spec.js` file.

## Notes On The Assignment

To be honest, I know that this is not representative of my best work. Having been heads down writing mainly
front-end code for nearly the past 8 months, I've had a bit of atrophy with writing Node.

I also felt like I decided to make it more difficult on my self by trying to understand `createReadStream`
without having any prior experience with it. This wound up being a large time sink until I fully
understood that I needed to wait until the stream had finished in order to manipulate the data.

If I were to approach this problem again, I would definitely do it a little differently. Perhaps by
reading all of the data into a SQLite database, then create various Express API endpoints to return the
proper data. I believe that this would have also made the code easier to test. Assuming that the data
does not change much in the plans.csv and zips.csv file, a caching layer would also help speed up the
application. Having an API layer would have also allowed me to potentially create a super light-weight
front end to interact with as well.

There could also be a more unique approach where this could be a command line interface that accepts
various flags with file names - allowing the inputs to be more dynamic.
`node index.js -slcspFile FILE.csv -plans FILE.csv -zips FILE.csv`

### Fun Facts
- There are only 36 states/territories represented in the plans.csv file.
- There are 461 zip codes that appear more than once in the zips.csv file.
- I believe there are 240 ambiguous zip codes - meaning zip codes with >1 rate_plan
- I learned that there are 13 multistate ZIP Codes.
