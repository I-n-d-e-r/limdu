/**
 * Demonstrates cross-validation testing of a classifier.
 * 
 * @author Erel Segal-Halevi
 * @since 2013-06
 */

var util = require('util');
var datasets = require('../datasets');
var PrecisionRecall = require("../PrecisionRecall");
var train_and_test = require('../train_and_test').train_and_test;
var associative = require('../associative');

console.log("main demo start");

var dataset = datasets.read("../datasets/Dataset1Woz.txt");
var numOfFolds = 5; // for k-fold cross-validation

var binaryClassifierType = require('../classifier/lib/bayesian').Bayesian; 
//var binaryClassifierType = require('../brain').NeuralNetwork; 

var binaryClassifierOptions = {};
var microAverage = new PrecisionRecall();
var macroAverage = new PrecisionRecall();
var verbosity = 1;

datasets.partitions(dataset, numOfFolds, function(partition) {
	train_and_test(
		binaryClassifierType, binaryClassifierOptions,
		partition.train, partition.test, verbosity,
		microAverage, macroAverage
	);
});

associative.multiply_scalar(macroAverage, 1/numOfFolds);

console.log("\n\nMACRO AVERAGE FULL STATS:")
console.dir(macroAverage.fullStats());
console.log("\nSUMMARY: "+macroAverage.shortStats());

microAverage.calculateStats();
console.log("\n\nMICRO AVERAGE FULL STATS:")
console.dir(microAverage.fullStats());
console.log("\nSUMMARY: "+microAverage.shortStats());

console.log("main demo end");