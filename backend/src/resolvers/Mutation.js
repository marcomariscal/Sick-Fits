const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Mutations = {
	async createItem(parent, args, ctx, info) {
		// todo: check if they are logged in
		// access the db with ctx.db
		const item = ctx.db.mutation.createItem(
			{
				data: {
					...args
				}
			},
			info
		);

		return item;
	},
	updateItem(parent, args, ctx, info) {
		// first take a copy of the updates
		const updates = { ...args };
		// remove the id from the update, since we don't want to update/edit the id
		delete updates.id;
		// run the update method
		return ctx.db.mutation.updateItem(
			{
				data: updates,
				where: {
					id: args.id
				}
			},
			info
		);
	},

	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		const item = await ctx.db.query.item({ where }, `{id title}`);
		// find the item
		// check if they own the item/have permissions
		//TODO
		// delete item
		return ctx.db.mutation.deleteItem({ where }, info);
	},

	async signup(parent, args, ctx, info) {
		args.email = args.email.toLowerCase();
		// encrypt the password; pass in salt for second argument that creates unique hash
		const password = await bcrypt.hash(args.password, 10);
		// create user in the database
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					password,
					permissions: { set: ["USER"] }
				}
			},
			info
		);
		// create JWT token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// set the jwt as a cookie on the response
		ctx.response.cookie("token", token, {
			// can only access through http (not js)
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
		});
		// return user to the browser
		return user;
	},

	async signin(parent, { email, password }, ctx, info) {
		// 1. check if there is a user with the email
		const user = await ctx.db.query.user({ where: { email } });
		if (!user) {
			throw new Error(`No such user found for email ${email}`);
		}
		// 2. check if password is correct
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			throw new Error("Invalid password!");
		}
		// 3. generate jwt token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// 4. set the cookie with token
		ctx.response.cookie("token", token, {
			// can only access through http (not js)
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
		});
		// 5. return user
		return user;
	}
};

module.exports = Mutations;
