import { Container, Typography, Paper, Box } from '@mui/material';
import TextLogo from './TextLogo';

const AboutPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          About Us
        </Typography>
        <Typography paragraph>
          At <TextLogo />, our mission is to provide inventors and businesses with comprehensive,
          reliable patent search services that enable informed decision-making in their innovation journey.
        </Typography>
        <Typography paragraph>
          Founded in 2020, <TextLogo /> emerged from the recognition that many inventors
          and small businesses struggle to access professional patent search services at reasonable costs.
          Our team of experienced patent professionals saw an opportunity to make these essential services
          more accessible while maintaining the highest standards of quality and thoroughness.
        </Typography>
        <Typography paragraph>
          We understand that navigating the patent landscape can be complex and time-consuming.
          That's why we've developed a streamlined process that combines advanced search technologies
          with expert analysis to provide you with clear, actionable insights about your invention's
          patentability and freedom to operate status.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
            Our Values
          </Typography>
          <Typography paragraph>
            <strong>Accessibility:</strong> We believe that quality patent search services should be
            accessible to inventors and businesses of all sizes. Our flat-rate pricing model ensures
            transparency and predictability in your innovation budget.
          </Typography>
          <Typography paragraph>
            <strong>Thoroughness:</strong> Every search we conduct is comprehensive and meticulous.
            We leave no stone unturned in our quest to provide you with a complete picture of the
            relevant patent landscape.
          </Typography>
          <Typography paragraph>
            <strong>Expertise:</strong> Our team brings years of experience in patent analysis and
            prosecution. We combine technical knowledge with patent expertise to deliver insights
            that matter to your innovation journey.
          </Typography>
          <Typography paragraph>
            <strong>Clarity:</strong> We believe in clear communication. Our reports are detailed
            yet accessible, providing you with the information you need to make informed decisions
            about your intellectual property strategy.
          </Typography>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
            Our Commitment
          </Typography>
          <Typography paragraph>
            We are committed to supporting innovation by providing reliable, professional patent
            search services that help inventors and businesses make informed decisions about their
            intellectual property. Whether you're a solo inventor, startup, or established business,
            we're here to help you navigate the patent landscape with confidence.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
