var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	errors = require('../lib/errors'),
	config = require('../config'),
	photoDir = config.photoDir,
	avatarExt = config.avatarExt,
	Photo, Photos;

Photo = module.exports = syBookshelf.Model.extend({
	tableName: 'photos',
	fields: [
		'id', 'userid', 'description', 'posttime'
	],

	defaults: function () {
		return {
			description: '',
			posttime: new Date()
		};
	},

	toJSON: function () {
		var ret = Photo.__super__.toJSON.apply(this, arguments);
		// append avatar
		if (!this.isNew()) {
			ret['uri'] = this.getURI();
		}
		return ret;
	},

	updateImage: function (tmp) {
		var target = this.getPath(), self = this;
		return new Promise(function (resolve, reject) {
			fs.readFile(tmp, function (err, data) {
				if (err) return reject(errors[30000]);
				fs.writeFile(target, data, function (err) {
					if (err) return reject(errors[30001]);
					resolve(self);
				});
			});
		});
	},
	deleteImage: function () {
		var target = this.getPath(), self = this;
		return new Promise(function (resolve, reject) {
			fs.unlink(target, function (err) {
				if (err) return reject(errors[30002]);
				resolve(self);
			});
		});
	},

	getName: function () {
		return this.get('userid') + '/' + this.id + avatarExt;
	},
	getURI: function () {
		return '/photos/' + this.getURI();
	},
	getPath: function () {
		return path.join(photoDir, this.getName());
	}
}, {
	randomForge: function () {
		return Photo.forge({
			description: chance.sentence(),
			posttime: chance.date({ year: 2013 })
		});
	},

	find: function (query) {
		var accepts = ['id', 'userid'];
		return Photo.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	}
});

Photos = Photo.Set = syBookshelf.Collection.extend({
	model: Photo
});