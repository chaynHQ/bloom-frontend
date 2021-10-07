import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import Link from '../components/Link';

const Home: NextPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Starter <Link href="https://nextjs.org">Next.js</Link>,{' '}
          <Link href="https://redux.js.org/">Redux</Link> and{' '}
          <Link href="https://mui.com/">MUI</Link> project
        </Typography>
        <Typography variant="body1" component="p" gutterBottom>
          Get started by editing the <code>pages/index.tsx</code> file
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          component={Link}
          noLinkStyle
          href="https://nextjs.org/docs"
        >
          Next.js docs
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
