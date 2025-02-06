import { Box } from '@mui/material';

interface TextLogoProps {
  color?: string;
  size?: string;
}

const TextLogo = ({ color = 'inherit', size = 'inherit' }: TextLogoProps) => {
  return (
    <Box 
      component="span" 
      sx={{ 
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        color
      }}
    >
      Freedom
      <Box 
        component="span" 
        sx={{ 
          color: '#ff4444',
          fontWeight: 900,
          fontSize: size === 'inherit' ? '1.2em' : `calc(${size} * 1.2)`,
          lineHeight: 0.8,
          transform: 'translateY(2px)',
          mx: '1px'
        }}
      >
        2
      </Box>
      Operate
    </Box>
  );
};

export default TextLogo;
