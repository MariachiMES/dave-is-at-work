import React from 'react';
import { useContext, useEffect, useState } from 'react';
import Avatar from './Avatar';
import { UserContext } from './UserContext';

export default function Chat() {
	const [ws, setWs] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState({});
	const [selectedUser, setSelectedUser] = useState();
	const { username, id } = useContext(UserContext);
	const [newMessage, setNewMessage] = useState('');

	useEffect(() => {
		const ws = new WebSocket('ws://localhost:4040');
		setWs(ws);
		ws.addEventListener('message', handleMessage);
	}, []);
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
		}
	}
	function selectContact(userId) {
		setSelectedUser(userId);
	}

	const othersOnline = { ...onlineUsers };
	delete othersOnline[id];

	function sendMessage(e) {
		e.preventDefault();
		ws.send(
			JSON.stringify({
				message: {
					recipient: selectedUser,
					text: newMessage,
				},
			})
		);
		setNewMessage('');
	}

	return (
		<div className='flex h-screen'>
			<div className='text-white bg-blue-900 w-1/3'>
				<div className=' text-blue-600 font-bold flex gap-2 p-4'>
					DAVE IS AT WORK
				</div>

				{Object.keys(othersOnline).map((userId) => (
					<div
						key={userId}
						onClick={() => selectContact(userId)}
						className={
							'p-2 border-b border-gray-100 py-2 flex gap-2 items-center cursor-pointer ' +
							(userId === selectedUser
								? 'bg-gray-900 text-gray-100'
								: 'bg-blue-800')
						}
					>
						<Avatar username={othersOnline[userId]} userId={userId} />
						<span>{onlineUsers[userId]}</span>
					</div>
				))}
			</div>
			<div className='flex flex-col bg-gray-900 w-2/3 p-2'>
				<div className=' text-white flex-grow'>
					{!selectedUser && (
						<div className='flex h-full flex-grow items-center justify-center'>
							<div>&larr; Select A Person From The SideBar</div>
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
