import {useContext} from 'react'
import Register from './components/Register'
import { UserContext } from './components/UserContext'

export default function Routes() {
    const {username, id} = useContext(UserContext)
    if(username)
  return (

    "logged in"
  )
  return (
    <div>
        <Register/>
        <h2>not logged in</h2>
        {console.log("not logged in")}
    </div>
    
  )
}
