import { Box, Typography, Paper, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const FTOSummary = () => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 3.5, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Understanding Freedom to Operate (FTO)
      </Typography>
      <Typography paragraph>
        Freedom to Operate (FTO) is a comprehensive analysis to determine whether your product or technology 
        can be commercially used without infringing valid intellectual property rights of others, particularly patents.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h6" color="primary" gutterBottom>
            Why It's Important
          </Typography>
          <Typography paragraph>
            An FTO search helps prevent costly patent infringement disputes by identifying potential obstacles 
            before significant investments are made in product development or market launch. This proactive 
            approach is crucial for protecting your business interests and ensuring smooth commercialization.
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" color="primary" gutterBottom>
            When to Conduct FTO
          </Typography>
          <Typography paragraph>
            FTO analysis is ideally performed early in product development, before major investments, when 
            entering new markets, or before product launch to minimize risks and ensure freedom to commercialize.
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" color="primary" gutterBottom>
            What We Provide
          </Typography>
          <Typography paragraph>
            Our comprehensive FTO search service includes thorough analysis of existing patents, detailed 
            recommendations, and clear risk assessments to help you make informed decisions about your 
            intellectual property strategy.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/fto-details')}
          sx={{ alignSelf: 'flex-start', mt: 2 }}
        >
          Learn More About FTO
        </Button>
      </Box>
    </Paper>
  );
};

export const FTODetailedPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom>
        Freedom to Operate: In-Depth Guide
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Business Goals and Risk Assessment
        </Typography>
        <Typography paragraph>
          When determining whether to conduct an FTO search, it's crucial to review and rank the relative 
          importance of your business goals. This assessment should consider whether you could walk away 
          from specific goals if necessary, given that permanent injunction is a potential remedy for 
          IP rights infringement.
        </Typography>
        <Typography paragraph>
          Key considerations include:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" paragraph>
            Geographic scope of your target market
          </Typography>
          <Typography component="li" paragraph>
            Current investment in the business goal
          </Typography>
          <Typography component="li" paragraph>
            Potential impact on future investors or funding
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Risk of IP Infringement
        </Typography>
        <Typography paragraph>
          The assessment of infringement risk must consider:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" paragraph>
            Cost of potential defense in litigation
          </Typography>
          <Typography component="li" paragraph>
            Possible damages awards
          </Typography>
          <Typography component="li" paragraph>
            Risk of permanent injunction
          </Typography>
          <Typography component="li" paragraph>
            Value of lost business opportunities
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Investment Milestones Requiring FTO Analysis
        </Typography>
        <Typography paragraph>
          Key business decisions that should trigger new or updated FTO studies include:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" paragraph>
            Selection of development targets
          </Typography>
          <Typography component="li" paragraph>
            Identification of key technologies
          </Typography>
          <Typography component="li" paragraph>
            Commencement of development
          </Typography>
          <Typography component="li" paragraph>
            Selection of manufacturing technology
          </Typography>
          <Typography component="li" paragraph>
            Commercial launch preparations
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Scope of FTO Investigation
        </Typography>
        <Typography paragraph>
          A comprehensive FTO search typically includes:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" paragraph>
            Patent database searches
          </Typography>
          <Typography component="li" paragraph>
            Scientific and technical publication reviews
          </Typography>
          <Typography component="li" paragraph>
            Analysis of patent ownership and status
          </Typography>
          <Typography component="li" paragraph>
            Review of relevant business information
          </Typography>
          <Typography component="li" paragraph>
            Assessment of potential licensing opportunities
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default { FTOSummary, FTODetailedPage };
