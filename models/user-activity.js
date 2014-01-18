var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserActivity, UserActivitys;

UserActivity = module.exports = syBookshelf.Model.extend({
	tableName: 'user_activity',
	fields: [
		'id', 'userid', 'activityid', 'isaccepted'
	]
}, {

});

UserActivitys = UserActivity.Set = syBookshelf.Collection.extend({
	model: UserActivity
});