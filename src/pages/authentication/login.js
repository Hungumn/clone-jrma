import { Box, CardContent, Container, Typography, Card } from '@mui/material';
import Head from 'next/head';
import { useEffect } from 'react';
import LoginDefault from "../../../src/components/Login/index";
import Amplify, { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';

const Login = () => {
	const router = useRouter();

	useEffect(() => {
		const checkLogin = async () => {
			try {
				const cognitoUser = await Auth.currentAuthenticatedUser();
				const currentSession = await Auth.currentSession();
				//console.log({ currentSession, cognitoUser });
				if (cognitoUser) {
					router.push(`/dashboard`);
				}
			} catch (err) {
				//console.log('err', err);
				router.push('/authentication/login');
			}
		};
		checkLogin();
	}, []);
	return (
		<div>
			<Head>
				<title>Dan Japan</title>
			</Head>

			<Box
				sx={{
					backgroundColor: 'background.default',
					display: 'flex',
					flexDirection: 'column',
					minHeight: '100vh',
				}}
			>
				<Container maxWidth="md" sx={{ py: '80px' }}>
					<CardContent
						sx={{
							display: 'flex',
							flexDirection: 'column',
							p: 4,
						}}
					>
						<LoginDefault />
					</CardContent>
				</Container>
			</Box>
		</div>
	);
};

export default Login;
