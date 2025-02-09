import { Typography, Box } from '@mui/material';
import { useEffect, useState } from 'react';

interface TextCarouselProps {
  phrases: string[];
  interval?: number;
}

const TextCarousel = ({ phrases, interval = 3000 }: TextCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeTimeout = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        setIsVisible(true);
      }, 500); // Half a second for fade out
    }, interval);

    return () => clearInterval(fadeTimeout);
  }, [phrases, interval]);

  return (
    <Box sx={{ height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Typography
        variant="h4"
        component="div"
        sx={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          textAlign: 'center',
          color: 'primary.main',
          fontWeight: 'bold'
        }}
      >
        {phrases[currentIndex]}
      </Typography>
    </Box>
  );
};

export default TextCarousel;
