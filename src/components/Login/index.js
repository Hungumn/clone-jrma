import { Box, Button, FormHelperText, TextField, Typography, Card } from '@mui/material';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { Auth } from 'aws-amplify';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from "../../../src/hooks/use-auth";
import { api } from '../../../src/api';
export default function LoginDefault(props) {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const { login } = useAuth();
	return (
		<>
			<Card sx={{ p: 8, pb: 10, px: 12 }} elevation={8}>
				<Box
					sx={{
						mb: 3,
					}}
				>
					<Box>
						<Typography textAlign={'center'} color="textPrimary" gutterBottom variant="h5">
							{user ? '' : 'DMC（DanJapan Membership Control）'}
						</Typography>
					</Box>
					<Box>
						<Typography textAlign={'center'} color="textPrimary" gutterBottom variant="h4">
							{user ? '2 step verification' : 'Login'}
						</Typography>
					</Box>
				</Box>
				<Box
					sx={{
						flexGrow: 1,
						mt: 5,
						display: user ? 'block' : 'none',
					}}
				>
					<Typography textAlign={'left'} color="textPrimary" gutterBottom>
                        Please enter the verification code.
					</Typography>
					<Typography textAlign={'left'} color="textPrimary" gutterBottom>
                        If you did not receive it, please log in again and try again.
					</Typography>
				</Box>
				<Box>
					{user ? (
						<Formik
							enableReinitialize={true}
							initialValues={{
								code: '',
							}}
							validationSchema={Yup.object().shape({
								code: Yup.string().required(),
							})}

						>
							{({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
								<form noValidate onSubmit={handleSubmit} {...props}>
									<TextField
										error={Boolean(touched.code && errors.code)}
										fullWidth
										helperText={touched.code && errors.code}
										label="Authentication code"
										margin="normal"
										name="code"
										onBlur={handleBlur}
										onChange={handleChange}
										value={values.code}
										variant="outlined"
										required
										autoFocus={true}
										inputProps={{
											form: {
												autocomplete: 'off',
											},
										}}
									/>

									{errors.submit && (
										<Box sx={{ mt: 3 }}>
											<FormHelperText error>{errors.submit}</FormHelperText>
										</Box>
									)}
									<Box sx={{ mt: 2 }}>
										<Button
											color="primary"
											disabled={isSubmitting}
											fullWidth
											size="large"
											type="submit"
											variant="contained"
											sx={{ mt: 1 }}
										>
											Certification
										</Button>
									</Box>
								</form>
							)}
						</Formik>
					) : (
						<Formik
							enableReinitialize={true}
							initialValues={{
								email: '',
								password: '',
								submit: null,
							}}
							validationSchema={Yup.object().shape({
								email: Yup.string().max(255).required(),
								password: Yup.string().required(),
							})}
							onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
								try {
									//console.log('login');

									const userLogin = await Auth.signIn(values.email, values.password);
									console.log({ userLogin });
									console.log('CUSTOM_CHALLENGE', userLogin.challengeName);

									//console.log({ userLogin });
									if (userLogin) {
										if (userLogin.challengeName === 'NEW_PASSWORD_REQUIRED') {
											await Auth.completeNewPassword(
												userLogin, // the Cognito User Object
												'123123123', // the new password
												// OPTIONAL, the required attributes
											);
										}

										setUser(userLogin);
									}
								} catch (e) {
									//console.log(e);
									toast.error('Login error');
								}
							}}
						>
							{({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
								<form noValidate onSubmit={handleSubmit} {...props}>
									<TextField
										error={Boolean(touched.email && errors.email)}
										fullWidth
										helperText={touched.email && errors.email}
										label="ID"
										margin="normal"
										name="email"
										onBlur={handleBlur}
										onChange={handleChange}
										type="email"
										value={values.email}
										variant="outlined"
										required
										autoFocus={false}
									/>
									<TextField
										error={Boolean(touched.password && errors.password)}
										fullWidth
										helperText={touched.password && errors.password}
										label="Password"
										margin="normal"
										name="password"
										onBlur={handleBlur}
										onChange={handleChange}
										type="password"
										value={values.password}
										variant="outlined"
										required
										autoFocus={false}
									/>
									{errors.submit && (
										<Box sx={{ mt: 3 }}>
											<FormHelperText error>{errors.submit}</FormHelperText>
										</Box>
									)}
									<Box sx={{ mt: 2 }}>
										<Button
											color="primary"
											disabled={isSubmitting}
											fullWidth
											size="large"
											type="submit"
											variant="contained"
											sx={{ mt: 1 }}
										>
											Login
										</Button>
									</Box>
								</form>
							)}
						</Formik>
					)}
				</Box>
			</Card>
		</>
	);
}
