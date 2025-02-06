import { Box, Typography } from '@mui/material';

interface LogoProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color?: string;
}

const Logo = ({ variant = 'h3', color = '#1a237e' }: LogoProps) => {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Typography
        variant={variant}
        component="span"
        sx={{
          fontFamily: 'Roboto Slab, serif',
          fontWeight: 500,
          color: color,
        }}
      >
        Freedom
      </Typography>
      <Typography
        variant={variant}
        component="span"
        sx={{
          color: '#ff4444',
          fontSize: `calc(${variant === 'h1' ? '3.75rem' : variant === 'h2' ? '3rem' : variant === 'h3' ? '2.5rem' : variant === 'h4' ? '2rem' : variant === 'h5' ? '1.5rem' : '1.25rem'} * 1.2)`,
          fontWeight: 900,
          mx: 0,
          lineHeight: 0.8,
          transform: 'translateY(4px)',
        }}
      >
        2
      </Typography>
      <Typography
        variant={variant}
        component="span"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          color: color,
        }}
      >
        Operate
      </Typography>
    </Box>
  );
};

export default Logo;
