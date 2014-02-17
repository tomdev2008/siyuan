var Promise = require('bluebird'),
	chance = new (require('chance'))(),
	errors = require('../lib/errors'),
	requireFn = require('../lib/requireFn'),
	syBookshelf = require('./base'),
	IssueComment = require('./issue-comment'),
	User = requireFn('./user'),
	IssueComments = IssueComment.Set,
	Issue, Issues;

Issue = module.exports = syBookshelf.Model.extend({
	tableName: 'issues',
	fields: [
		'id', 'userid', 'groupid', 'activityid', 'title', 'body', 'posttime'
	],
	omitInJSON: ['userid'],
	appended: ['user'],

	defaults: function () {
		return {
			title: '',
			body: '',
			posttime: new Date()
		};
	},

	fetch: function () {
		return Issue.__super__.fetch.apply(this, arguments)
			.then(function (issue) {
				if (!issue) return issue;
				return issue.countComments();
			});
	},

	user: function () {
		return this.belongsTo(User(), 'userid');
	},
	comments: function () {
		return this.hasMany(IssueComment, 'issueid');
	},

	countComments: function () {
		var self = this;
		return IssueComments.forge().query()
			.where('issueid', '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numComments', d[0]["count(`id`)"]);
			});
	}
}, {
	randomForge: function () {
		return Issue.forge({
			title: chance.sentence(),
			body: chance.paragraph(),
			posttime: chance.date({ year: 2013 })
		});
	},

	view: function (query) {
		return Issue.forge({ id: query['id'] })
			.fetch({
				withRelated: ['user.profile']
			}).then(function (issue) {
				if (!issue) return Promise.rejected(errors[20603]);
				return IssueComments.forge()
					.query(function (qb) {
						qb.where('issueid', '=', issue.id);
						qb.orderBy('posttime', 'desc');
					}).fetch().then(function (comments) {
						return issue.set('comments', comments);
					});
			});
	}
});

Issues = Issue.Set = syBookshelf.Collection.extend({
	model: Issue
}, {
	finder: function (qb, query) {
		['groupid', 'activityid'].forEach(function(k){
			query[k] ? qb.where(k, query[k]) : qb.whereNull(k);//如果没有传值，就要给他取null
		});
		['id', 'userid', 'title'].forEach(function (k) {
			if (k in query) {
				qb.where(k, query[k]);
			}
		});
	},

	searcher: function (qb, query) {
		var count = 0;
		['groupid', 'activityid'].forEach(function(k){
			query[k] ? qb.where(k, query[k]) : qb.whereNull(k);//如果没有传值，就要给他取null
		});
		['userid'].forEach(function (k) {
			if (k in query) {
				count++;
				qb.where(k, query[k]);
			}
		});
		['title', 'body'].forEach(function (k) {
			if (k in query) {
				count++;
				qb.where(k, 'like', '%' + query[k] + '%');
			}
		});
		if (count < 1) query['limit'] = 0;
	}
});
