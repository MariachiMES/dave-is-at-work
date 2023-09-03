import {useContext, useState} from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const {setLoggedInUsername, setLoggedInId} = useContext(UserContext)
        async function register(e) {
            e.preventDefault()
        const {data} = await axios.post('/register', {username, password})
            setLoggedInUsername(username)
            setLoggedInId(data.id)
            console.log(data)
}
  return (
    <div className = 'bg-gray-900 h-screen flex items-center'>
    <form className = 'w-64 mx-auto mb-12' onSubmit={register}>
        <input value = {username} onChange={e=>setUsername(e.target.value)} type = "text" placeholder="username" className='block w-full border rounded-sm mb-2 p-2'/>
        <input value = {password} onChange={e=> setPassword(e.target.value)} type = 'password' placeholder = 'password' className='block w-full border rounded-sm p-2 mb-2'/>
        <button className = "bg-blue-500 text-white block w-full rounded-sm p-2">Register</button>
    </form>

    </div>
  )
}
