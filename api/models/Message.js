const Mongoose = require('mongoose');

const messageSchema = new Mongoose.Schema(
	{
		sender: {
			type: Mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		recipient: {
			type: Mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		text: String,
	},
	{
		timestamps: true,
	}
);

const Message = Mongoose.model('Message', messageSchema);

module.exports = Message;
