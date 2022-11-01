import { Auth } from 'aws-amplify';
import axios from 'axios';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { useAuth } from "../hooks/use-auth";

/**
 *
 * parse error response
 */
function parseError(messages) {
	// error
	if (messages) {
		if (messages instanceof Array) {
			return Promise.reject({ messages: messages });
		} else {
			return Promise.reject({ messages: [messages] });
		}
	} else {
		return Promise.reject({ messages: ['エラーが発生しました'] });
	}
}

/**
 * parse response
 */
function parseBody(response) {
	//  if (response.status === 200 && response.data.status.code === 200) { // - if use custom status code
	if (response.status === 200) {
		return response.data;
	} else {
		return this.parseError(response.data.messages);
	}
}

/**
 * axios instance
 */
let instance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL,
	paramsSerializer: function (params) {
		return qs.stringify(params, { indices: false });
	},
	headers: {
		'Content-Type': 'application/json',
		'Acess-Control-Allow-Origin': '*',
		// Authorization: `${token}`,
		Accept: 'application/json',
	},
});

// request header
instance.interceptors.request.use(
	(config) => {
		if (localStorage.getItem('jwt-user')) {
			config.headers.Authorization = localStorage.getItem('jwt-user');
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// response parse
instance.interceptors.response.use(
	(response) => {
		return parseBody(response);
	},
	(error) => {
		console.warn('Error status', error.response.status);
		// return Promise.reject(error)
		if (error.response) {
			// if (error.response.status === 403 || error.response.status === 401) {
			// 	localStorage.clear();
			// 	window.location.href = '/';
			// }
			return parseError(error.response.data);
		} else {
			return Promise.reject(error);
		}
	},
);

const useAxiosLoader = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	var numberOfAjaxCAllPending = 0;
	useEffect(() => {
		const handleRequest = async (config) => {
			const data = await Auth.currentSession();
			localStorage.setItem('jwt-user', data.accessToken.jwtToken);
			config.headers.Authorization = data.accessToken.jwtToken;
			if (!user.signInUserSession.accessToken.payload['cognito:groups'][0]) {
				return;
			}
			if (
				user.signInUserSession.accessToken.payload['cognito:groups'][0] === 'JmraReadonly' &&
				(config.method === 'put' || config.method === 'delete')
			) {
				//console.log('asdasdasdasd');
				return;
			}
			numberOfAjaxCAllPending++;
			setIsLoading(true);
			return config;
		};
		const handleResponse = (response) => {
			numberOfAjaxCAllPending--;
			if (numberOfAjaxCAllPending == 0) {
				setIsLoading(false);
			}
			return response;
		};
		const handleError = (error) => {
			numberOfAjaxCAllPending--;
			if (numberOfAjaxCAllPending == 0) {
				setIsLoading(false);
			}
			return Promise.reject(error);
		};

		const reqInterceptor = instance.interceptors.request.use(handleRequest, handleError);
		const resInterceptor = instance.interceptors.response.use(handleResponse, handleError);
		return () => {
			instance.interceptors.request.eject(reqInterceptor);
			instance.interceptors.response.eject(resInterceptor);
		};
	}, []);

	return isLoading;
};

export const api = instance;
export { useAxiosLoader };
