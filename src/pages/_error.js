import { Box } from '@mui/material';
import Link from 'next/link';

export default function FourOhFour() {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
				flexDirection: 'column',
			}}
		>
			<h1>お探しのページは存在しません。 </h1>
			<Link href="/">
				<a> キャンセル</a>
			</Link>
		</Box>
	);
}
