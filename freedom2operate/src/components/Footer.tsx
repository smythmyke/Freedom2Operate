import { Box, Container, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            flexWrap: 'wrap'
          }}
        >
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/about"
            color="inherit"
            sx={{ textDecoration: 'none' }}
          >
            About
          </Link>
          <Link
            component={RouterLink}
            to="/expertise"
            color="inherit"
            sx={{ textDecoration: 'none' }}
          >
            Technical Expertise
          </Link>
          <Link
            component={RouterLink}
            to="/submit"
            color="inherit"
            sx={{ textDecoration: 'none' }}
          >
            Submit
          </Link>
          <Link
            component={RouterLink}
            to="/contact"
            color="inherit"
            sx={{ textDecoration: 'none' }}
          >
            Contact
          </Link>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 2 }}
        >
          © {new Date().getFullYear()} Freedom2Operate. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
