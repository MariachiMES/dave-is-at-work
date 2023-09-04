const Mongoose = require('mongoose');

const userSchema = new Mongoose.Schema(
	{
		username: {
			type: String,
			unique: true,
		},
		password: String,
	},
	{
		timestamps: true,
	}
);

const User = Mongoose.model('User', userSchema);

module.exports = User;
