var _ = require("underscore")._;
var fs = require("fs");
var knncommon = require("./knncommon");

/**
 * kNN classifier
 */

var kNN = function(opts) {
	this.k = opts.k
	this.distanceFunction = opts.distanceFunction
	this.distanceWeightening = opts.distanceWeightening

	this.labels = []
}

kNN.prototype = {

	trainOnline: function(sample, labels) {
	},

	trainBatch : function(dataset) {
		this.dataset = dataset
	},

	classify: function(sample, explain) {

		var dfmap = {
			'EuclideanDistance': knncommon.euclidean_distance,
			'ChebyshevDistance': knncommon.chebyshev_distance,
			'ManhattanDistance': knncommon.manhattan_distance,
			'DotDistance': 		 knncommon.dot_distance
		}

		var trainset = _.map(this.dataset, function(value){ return {
																	'input': this.complement(value['input']),
																	'output': value['output']
																	}
																 }, this);

		


		var eq = _.filter(trainset, function(value){ return _.isEqual(value['input'], sample); });
		
		if (eq.length != 0)
			return { 
				 	'classification': (eq[0]['output'] == 1 ? 1 : -1),
				 	'explanation': 'same'
		   			}
		

		var distances = _.map(trainset, function(value){ return {
																'input'   : value['input'],
																'output'  : value['output'],
																'distance': dfmap[this.distanceFunction](sample, value['input']),
																'score'   : this.distanceWeightening(dfmap[this.distanceFunction](sample, value['input']))
																}
																}, this);

		var distances = _.sortBy(distances, function(num){ return num['distance']; })

		var knn = distances.slice(0, this.k)

		var output = _.groupBy(knn, function(num){ return num['output'] })

		var thelabel = {'label': -1, 'score': -1}

		_.each(output, function(value, label, list){ 
			var sum = _.reduce(value, function(memo, num){ return memo + num['score']; }, 0);
			if (sum > thelabel['score'])
				{
					thelabel['score'] = sum	
					thelabel['label'] = label	
				}
		}, this)

		return { 
				 'classification': (thelabel['label'] == 1 ? thelabel['score'] : (-1) * thelabel['score']),
				 'explanation': this.translatetrain(knn)	
			   }
		},

	translatetrain: function(input)
	{
		if (this.featureLookupTable)
		{
			_.each(input, function(value, key, list){ 
				input[key]['input'] = this.translaterow(value['input'])
			}, this)
			return input
		}
		else
		return input

	},

	translaterow: function(row)
	{
		var output = {}

		_.each(row, function(value, key, list){ 
			if (value != 0)
				output[this.featureLookupTable['featureIndexToFeatureName'][key]] = value
		}, this)

		return output
	},

	complement: function(input) {
		var len = this.featureLookupTable['featureIndexToFeatureName'].length
		_(len - input.length).times(function(n){
			input.push(0)
		})
		return input
	},

	getAllClasses: function() {
	},

	stringifyClass: function (aClass) {
		return (_(aClass).isString()? aClass: JSON.stringify(aClass));
	},

	toJSON : function() {
	},

	fromJSON : function(json) {
	},
	
	setFeatureLookupTable: function(featureLookupTable) {
		this.featureLookupTable = featureLookupTable
	},
}


module.exports = kNN;