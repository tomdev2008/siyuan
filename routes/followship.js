/**
 * @class 关注
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	User = require('../models/user'),
	Followship = require('../models/followship'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * POST /api/followship/follow
	 * @method 关注用户
	 * @param {Number} followid 被关注者ID
	 * @param {String} remark 备注名
	 * @return {JSON}
	 */
	app.post('/api/followship/follow', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		req.body['userid'] = user.id;
		User.forge({ id: req.body['followid'] }).fetch()
			.then(function (user) {
				if (!user) return Promise.rejected(errors[20003]);
			}).then(function () {
				return Followship.forge(
						_.pick(req.body, ['userid', 'followid'])
					).fetch()
					.then(function (followship) {
						if (followship) return Promise.rejected(errors[20506]);
					});
			}).then(function () {
				return Followship.forge(req.body).save();
			}).then(function () {
				res.send({ msg: 'Followee followed' });
			}).catch(next);
	});

	/**
	 * POST /api/followship/unfollow
	 * @method 取消关注
	 * @param {Number} followid 被关注者ID
	 * @return {JSON}
	 */
	app.post('/api/followship/unfollow', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		req.body['userid'] = user.id;
		Followship.forge(
				_.pick(req.body, ['userid', 'followid'])
			).fetch()
			.then(function (followship) {
				if (!followship) return Promise.rejected(errors[20603]);
				return followship.destroy();
			}).then(function () {
				res.send({ msg: 'Followee unfollowed' });
			}).catch(next);
	});

	/**
	 * POST /api/followship/remark
	 * @method 修改备注
	 * @param {Number} followid 粉丝ID
	 * @param {String} remark 备注名
	 * @return {JSON}
	 */
	app.post('/api/followship/remark', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		req.body['userid'] = user.id;
		Followship.forge(
				_.pick(req.body, ['userid', 'followid'])
			).fetch()
			.then(function (followship) {
				if (!followship) return Promise.rejected(errors[20603]);
				return followship.set(req.body).save();
			}).then(function () {
				res.send({ msg: 'Followee remarked' });
			}).catch(next);
	});

	/**
	 * POST /api/followship/following
	 * @method 用户的关注列表
	 * @param {Number} userid 关注者ID
	 * @return {JSON}
	 */
	app.get('/api/followship/following', function (req, res, next) {
		Followship.findFollowing(req.query)
			.then(function (followees) {
				res.send({ following: followees });
			}).catch(next);
	});

	/**
	 * POST /api/followship/followers
	 * @method 用户的粉丝列表
	 * @param {Number} followid 被关注者ID
	 * @return {JSON}
	 */
	app.get('/api/followship/followers', function (req, res, next) {
		Followship.findFollowers(req.query)
			.then(function (followers) {
				res.send({ followers: followers });
			}).catch(next);
	});
};