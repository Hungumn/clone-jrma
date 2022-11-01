import { Auth } from 'aws-amplify';
import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';
import { useRouter } from 'next/router';

var ActionType;
(function (ActionType) {
	ActionType['INITIALIZE'] = 'INITIALIZE';
	ActionType['LOGIN'] = 'LOGIN';
	ActionType['LOGOUT'] = 'LOGOUT';
})(ActionType || (ActionType = {}));

const initialState = {
	isAuthenticated: false,
	isInitialized: false,
	user: null,
};

const handlers = {
	INITIALIZE: (state, action) => {
		const { isAuthenticated, user } = action.payload;

		return {
			...state,
			isAuthenticated,
			isInitialized: true,
			user,
		};
	},
	LOGIN: (state, action) => {
		const { user } = action.payload;

		return {
			...state,
			isAuthenticated: true,
			user,
		};
	},
	LOGOUT: (state) => ({
		...state,
		isAuthenticated: false,
		user: null,
	}),
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

export const AuthContext = createContext({
	...initialState,
	login: () => Promise.resolve(),
	logout: () => Promise.resolve(),
});

export const AuthProvider = (props) => {
	const { children } = props;
	const [state, dispatch] = useReducer(reducer, initialState);
	const router = useRouter();

	useEffect(() => {
		const initialize = async () => {
			try {
				const user = await Auth.currentAuthenticatedUser();
				const data = await Auth.currentSession();
				if (user) {
					dispatch({
						type: ActionType.INITIALIZE,
						payload: {
							isAuthenticated: true,
							user,
						},
					});
					localStorage.setItem('jwt-user', data.accessToken.jwtToken);
				} else {
					dispatch({
						type: ActionType.INITIALIZE,
						payload: {
							isAuthenticated: false,
							user: null,
						},
					});
				}
			} catch (err) {
				console.error(err);
				dispatch({
					type: ActionType.INITIALIZE,
					payload: {
						isAuthenticated: false,
						user: null,
					},
				});
				router.push('/authentication/login');
			}
		};

		initialize();
	}, []);

	const login = async (user) => {
		dispatch({
			type: ActionType.LOGIN,
			payload: {
				user,
			},
		});
		localStorage.setItem('jwt-user', user.signInUserSession.accessToken.jwtToken);
	};

	const logout = async () => {
		dispatch({ type: ActionType.LOGOUT });
		localStorage.clear();
	};

	return (
		<AuthContext.Provider
			value={{
				...state,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export const AuthConsumer = AuthContext.Consumer;
