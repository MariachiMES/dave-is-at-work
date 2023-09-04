import React from 'react'
import { useEffect, useState} from 'react'
import Avatar from './Avatar'

export default function Chat() {
    const [ws, setWs] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState({})
    const [selectedUser, setSelectedUser] = useState()

    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:4040')
        setWs(ws)
        ws.addEventListener('message', handleMessage)

    }, [])
    function showOnlineUsers(usersArray) {
        const users = {
        }

        usersArray.forEach(({userId, username}) => {
            users[userId] = username
        })
        setOnlineUsers(users)
    }
    function handleMessage(e){
        const messageData = JSON.parse(e.data)
        if('online' in messageData) {
            showOnlineUsers(messageData.online)
        }
    }
    function selectContact (userId) {
        setSelectedUser(userId)
    }
  return (
    <div className = "flex h-screen">
        <div className = "text-white bg-blue-900 w-1/3"> 
        <div>DAVE IS AT WORK</div>
        
        {Object.keys(onlineUsers).map(userId=>
            
        <div key={userId} onClick={()=>selectContact(userId)} 
        className={"bg-blue-800 p-2 border-b border-gray-100 py-2 flex gap-2 items-center cursor-pointer " + (userId === selectedUser? "bg-blue-100 text-gray-800" : "bg-blue-800")}>
        <Avatar username={onlineUsers[userId]} userId={userId} />
        <span>
        {onlineUsers[userId]}
        </span></div>)}
        </div>
        <div className = "flex flex-col bg-gray-900 w-2/3 p-2">
            <div className=" text-white flex-grow">
                messages with selected person
            </div>
            <div className = "flex gap-2 ">
            <input 
            id = "stff" 
            name="message" type="text" 
            placeholder = "type your message here" 
            className = "bg-white flex-grow border p-2 rounded-sm"/>
            <button className = "bg-blue-500 p-2 text-white rounded-sm">Send</button>
            </div>
            
        </div>
    </div>
  )
}
