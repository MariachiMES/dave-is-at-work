const express = require('express');
const app = express();
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');

//CONNECT DATABASE
mongoose.connect(process.env.MONGODB_URL);

const saltRounds = bcrypt.genSaltSync(10);
//API TEST

async function getMessageData(req) {
	return new Promise((resolve, reject) => {
		const token = req.cookies?.token;
		if (token) {
			jwt.verify(token, jwtSecret, {}, (err, userData) => {
				if (err) throw err;
				resolve(userData);
			});
		} else {
			reject('no token');
		}
	});
}

app.use(express.json());

app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	})
);

app.use(cookieParser());

//PROFILE

app.get('/profile', (req, res) => {
	const token = req.cookies?.token;
	if (token) {
		jwt.verify(token, jwtSecret, {}, (err, userData) => {
			if (err) throw err;

			res.json(userData);
		});
	} else {
		res.status(403).json('no token');
	}
});

app.get('/users', async (req, res) => {
	const allUsers = await User.find({}, { '_id:': 1, username: 1 });
	res.json(allUsers);
	console.log('ALL THE USERS! ', allUsers);
});

//LOGIN

app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	const existingUser = await User.findOne({ username });
	if (!existingUser) {
		return res.status(500);
	}
	const verifiedUser = bcrypt.compareSync(password, existingUser.password);
	if (verifiedUser) {
		jwt.sign(
			{
				userId: existingUser._id,
				username,
			},
			jwtSecret,
			{},
			(err, token) => {
				if (err) throw err;
				console.log('THIS IS THE TOKEN', token, 'that was the token');
				res
					.cookie('token', token, { sameSite: 'none', secure: true })
					.status(201)
					.json({ id: existingUser._id, username });
				console.log(token, username);
			}
		);
	}
});

//REGISTER

app.post('/register', async (req, res) => {
	console.log('register');
	const { username, password } = req.body;
	try {
		const hashedPassword = bcrypt.hashSync(password, saltRounds);
		const createdUser = await User.create({
			username: username,
			password: hashedPassword,
		});
		jwt.sign(
			{
				userId: createdUser._id,
				username,
			},
			jwtSecret,
			{},
			(err, token) => {
				if (err) throw err;
				console.log('THIS IS THE TOKEN', token, 'that was the token');
				res
					.cookie('token', token, { sameSite: 'none', secure: true })
					.status(201)
					.json({ id: createdUser._id, username });
				console.log(token, username);
			}
		);
	} catch (err) {
		if (err) {
			throw err;
			res.status(500).json('THIS IS NOT WORKING, WHAT IS GOING ON');
		}
	}
});
//Logout
app.post('/logout', (req, res) => {
	res
		.clearCookie('token', { sameSite: 'none', secure: true })
		.status(200)
		.json('ok');
});

app.get('/messages/:id', async (req, res) => {
	const { id } = req.params;
	console.log('userId: ', id);
	const userData = await getMessageData(req);
	console.log('userData: ', userData);
	const ourUserId = userData.userId;
	console.log('our userId: ', ourUserId);
	const messages = await Message.find({
		sender: { $in: [id, ourUserId] },
		recipient: { $in: [id, ourUserId] },
	}).sort({ createdAt: 1 });
	res.json(messages);
	console.log(messages, 'these are all the messages');
});

//WEBSOCKET SERVER

const server = app.listen(4040);

const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
	connection.isAlive = true;
	connection.timer = setInterval(() => {
		connection.ping();
		connection.deathTimer = setTimeout(() => {
			connection.isAlive = false;
			connection.terminate();
			sendOnlineUsers();
			console.log('connection dead');
		}, 1000);
	}, 5000);
	connection.on('pong', () => {
		clearTimeout(connection.deathTimer);
	});
	console.log('websocket connected');

	function sendOnlineUsers() {
		[...wss.clients].forEach((client) => {
			client.send(
				JSON.stringify({
					online: [...wss.clients].map((c) => ({
						userId: c.userId,
						username: c.username,
					})),
				})
			);
		});
	}
	//READS USERNAME AND COOKIE FOR CURRENT CONNECTION
	const cookies = req.headers.cookie;
	if (cookies) {
		const tokenCookiesString = cookies
			.split(';')
			.find((str) => str.startsWith('token='));
		if (tokenCookiesString) {
			const token = tokenCookiesString.split('=')[1];
			if (token) {
				jwt.verify(token, jwtSecret, {}, (err, userData) => {
					if (err) throw err;
					const { userId, username } = userData;
					connection.userId = userId;
					connection.username = username;
				});
			}
		}
	}

	//HANDLE MESSAGING

	connection.on('message', async (message) => {
		const messageData = JSON.parse(message.toString());
		console.log(messageData);
		const { recipient, text } = messageData;
		if (recipient && text) {
			const newMessage = await Message.create({
				sender: connection.userId,
				recipient,
				text,
			});
			const recipients = [...wss.clients].filter((c) => c.userId === recipient);
			recipients.forEach((c) =>
				c.send(
					JSON.stringify({
						text,
						sender: connection.userId,
						recipient,
						_id: newMessage._id,
					})
				)
			);
		}
	});
	//NOTIFIES WHEN USER CONNECTS
	sendOnlineUsers();
});

wss.on('close', () => {
	console.log('disconnected');
});
