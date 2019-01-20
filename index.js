const retrieveFitment = require('./src/feedOps.js').retrieveFitment;

// set to true for year spans
// set to false for individual years
const spanYears = true;
retrieveFitment(spanYears);