import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
	const [username, setLoggedInUsername] = useState(null);
	const [id, setLoggedInId] = useState(null);
	useEffect(() => {
		axios.get('/profile').then((response) => {
			setLoggedInId(response.data.userId);
			setLoggedInUsername(response.data.username);
		});
	}, []);
	return (
		<UserContext.Provider
			value={{ username, setLoggedInUsername, id, setLoggedInId }}
		>
			{children}
		</UserContext.Provider>
	);
}
