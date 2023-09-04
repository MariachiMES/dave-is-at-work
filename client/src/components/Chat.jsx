import React from 'react';
import { useRef, useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';
import { uniqBy } from 'lodash';
import axios from 'axios';
import Contact from './Contact';

export default function Chat() {
	const [ws, setWs] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState({});
	const [selectedUser, setSelectedUser] = useState();
	const { username, id, setLoggedInId, setLoggedInUsername } =
		useContext(UserContext);
	const [newMessage, setNewMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const divBottom = useRef();
	const [offlineUsers, setOfflineUsers] = useState({});

	useEffect(() => {
		connectToWebSocket();
	}, []);

	function connectToWebSocket() {
		const ws = new WebSocket('ws://localhost:4040');
		setWs(ws);
		ws.addEventListener('message', handleMessage);
		ws.addEventListener('close', () => {
			setTimeout(() => {
				console.log(' Disconnected. trying to re-connect');
				connectToWebSocket();
			}, 1000);
		});
	}
	function showOnlineUsers(usersArray) {
		const users = {};

		usersArray.forEach(({ userId, username }) => {
			users[userId] = username;
		});
		setOnlineUsers(users);
	}
	function handleMessage(e) {
		const messageData = JSON.parse(e.data);
		if ('online' in messageData) {
			showOnlineUsers(messageData.online);
		} else {
			console.log(messageData);
			setMessages((prev) => [...prev, { ...messageData }]);
		}
	}
	function selectContact(userId) {
		setSelectedUser(userId);
	}

	function logout() {
		axios.post('/logout').then(() => {
			setWs(null);
			setLoggedInId(null);
			setLoggedInUsername(null);
		});
	}

	const othersOnline = { ...onlineUsers };
	delete othersOnline[id];

	function sendMessage(e) {
		if (e) e.preventDefault();
		if (!newMessage) {
			return;
		}
		ws.send(
			JSON.stringify({
				recipient: selectedUser,
				text: newMessage,
			})
		);
		setNewMessage('');
		setMessages((prev) => [
			...prev,
			{
				text: newMessage,
				sender: id,
				recipient: selectedUser,
				_id: Date.now(),
			},
		]);
	}
	useEffect(() => {
		const div = divBottom.current;
		if (div) {
			div.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}
	}, [messages]);

	useEffect(() => {
		if (selectedUser) {
			console.log('THIS IS THE SELECTED USER: ', selectedUser);
			axios.get('/messages/' + selectedUser).then((res) => {
				console.log(res);
				setMessages(res.data);
			});
		}
	}, [selectedUser]);

	useEffect(() => {
		axios.get('/users').then((res) => {
			const offlineUserArray = res.data
				.filter((user) => user._id !== id)
				.filter((user) => !Object.keys(onlineUsers).includes(user._id));
			const offlineUsers = {};
			offlineUserArray.forEach((user) => {
				offlineUsers[user._id] = user;
			});
			setOfflineUsers(offlineUsers);
		});
	}, [onlineUsers]);

	const uniqueMessages = uniqBy(messages, '_id');

	return (
		<div className='flex h-screen'>
			<div className='text-white bg-blue-900 w-1/3 flex flex-col'>
				<div className='flex-grow'>
					<div className=' text-blue-300 font-bold flex gap-2 p-4'>
						Welcome, {username}!!! Dave is at work!
					</div>
					<div>
						{Object.keys(othersOnline).map((userId) => (
							<Contact
								key={userId}
								id={userId}
								online={true}
								username={othersOnline[userId]}
								onClick={() => {
									setSelectedUser(userId);
									console.log({ userId });
								}}
								selected={userId === selectedUser}
							/>
						))}
						{Object.keys(offlineUsers).map((userId) => (
							<Contact
								key={userId}
								id={userId}
								online={false}
								username={offlineUsers[userId].username}
								onClick={() => setSelectedUser(userId)}
								selected={userId === selectedUser}
							/>
						))}
					</div>
				</div>

				<div className='p-2 text-center'>
					<button
						onClick={logout}
						className='text-sm text-gray-400 bg-red-900 py-1 px-2 border rounded-md'
					>
						Logout
					</button>
				</div>
			</div>

			<div className='flex flex-col bg-gray-900 w-2/3 p-2'>
				<div className=' text-white flex-grow'>
					{!selectedUser && (
						<div className='flex h-full flex-grow items-center justify-center'>
							<div>&larr; Select A Person From The SideBar</div>
						</div>
					)}
					{!!selectedUser && (
						<div className='relative h-full'>
							<div className='overflow-y-scroll absolute inset-0'>
								<div key={uniqueMessages.id} className='overflow-y-scroll'>
									{uniqueMessages.map((message) => (
										<div
											key={message._id}
											className={
												message.sender === id ? 'text-right' : 'text-left'
											}
										>
											<div
												className={
													'inline-block p-2 rounded-lg m-2 text-sm ' +
													(message.sender === id
														? 'bg-blue-500 text-white'
														: 'bg-white text-gray-500')
												}
											>
												{message.text}
											</div>
										</div>
									))}
								</div>
								<div ref={divBottom}></div>
							</div>
						</div>
					)}
				</div>
				{!!selectedUser && (
					<form onSubmit={sendMessage} className='flex gap-2 '>
						<input
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							id='stff'
							name='message'
							type='text'
							placeholder='type your message here'
							className='bg-white flex-grow border p-2 rounded-sm'
						/>
						<button className='bg-blue-500 p-2 text-white rounded-sm'>
							Send
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
