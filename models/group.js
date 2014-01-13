/**
 * Created by Cam on 14-1-2.
 */
var syBookshelf = require('./base'),
	GroupMember = require('./group-membership'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	fkGroup = 'groupid',
	Group, Groups;

Group = module.exports = syBookshelf.Model.extend({
	tableName: 'groups',
	fields: [
		'id', 'ownerid', 'name', 'description', 'createtime', 'avatar'
	],
	defaults: function(){
		return {
			createtime: new Date()
		};
	},
	//omitInJSON: ['id'],
	members: function () {
		return this.hasMany(GroupMember, fkGroup);
	}
}, {
	//这里的transaction有问题，还不会用。先同步，回头再改。
	createGroup: function (ownerid, name, description, avatar) {

		return syBookshelf.transaction(function (t) {

			new Group({
				'ownerid': ownerid,
				'name': name,
				'description': description,
				'avatar': avatar
			}).save(null, {transacting: t})
				.then(function (group) {
					return new GroupMember({
						'userid': ownerid,
						'groupid': group.id,
						'isowner': 1
					}).save(null, {transacting: t})
						.then(t.commit, t.rollback);
				}).catch(function (e) {
					console.log('rollback');
					t.rollback()
				});

		}).then(function (resp) {
				console.log(resp);
			}, function (err) {
				console.log('Error saving the Groups:');
				console.log(err);
			});
	}
});

Groups = Group.Set = syBookshelf.Collection.extend({
	model: Group
});