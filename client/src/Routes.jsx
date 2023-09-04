import {useContext} from 'react'
import Register from './components/Register'
import Chat from './components/Chat'
import { UserContext } from './components/UserContext'

export default function Routes() {
    const {username, id} = useContext(UserContext)
    if(username)
  return (

    <Chat/>
  )
  return (
    <div>
        <Register/>
       
    </div>
    
  )
}
