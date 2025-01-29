import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SecurityIcon from '@mui/icons-material/Security';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: '100%', px: { xs: 2, sm: 4, md: 6 } }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Freedom to Operate Patent Search
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Professional patent search services to help protect your innovations
        </Typography>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Comprehensive Search
            </Typography>
            <Typography color="text.secondary">
              Thorough analysis of existing patents and publications to identify potential conflicts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Flat Rate Pricing
            </Typography>
            <Typography color="text.secondary">
              $500 flat rate for inventions with up to 6 key features
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Confidential Analysis
            </Typography>
            <Typography color="text.secondary">
              Secure handling of your invention details with strict confidentiality
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Service Details */}
      <Paper sx={{ p: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Our Services
        </Typography>
        <Typography paragraph>
          Our Freedom to Operate (FTO) search service helps you understand whether your invention
          can be made, used, or sold without infringing valid intellectual property rights of others.
        </Typography>
        <Typography paragraph>
          We conduct thorough searches across multiple patent databases and analyze relevant patents
          to provide you with a clear understanding of the patent landscape around your invention.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            What's Included:
          </Typography>
          <ul>
            <Typography component="li">Comprehensive patent database search</Typography>
            <Typography component="li">Analysis of up to 6 key features</Typography>
            <Typography component="li">Detailed report of potential conflicts</Typography>
            <Typography component="li">Recommendations for proceeding</Typography>
          </ul>
        </Box>
      </Paper>

      {/* Security Section */}
      <Paper sx={{ p: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Your Data Security is Our Priority
        </Typography>
        <Typography paragraph>
          We use Firebase, Google Cloud's enterprise-grade platform, to ensure your data is secure and protected:
        </Typography>
        <Box sx={{ mt: 2 }}>
          <ul>
            <Typography component="li">End-to-end encryption for all data transmission</Typography>
            <Typography component="li">Secure cloud storage with automatic backups</Typography>
            <Typography component="li">Industry-standard authentication and authorization</Typography>
            <Typography component="li">Regular security audits and compliance checks</Typography>
          </ul>
        </Box>
      </Paper>

      {/* Team Expertise Section */}
      <Paper sx={{ p: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Expert Search Team
        </Typography>
        <Typography paragraph>
          Our team brings over 4 years of specialized experience in patent analysis and prosecution, 
          providing you with thorough and reliable freedom to operate assessments.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Areas of Expertise:
          </Typography>
          <ul>
            <Typography component="li">Electrical Engineering</Typography>
            <Typography component="li">Mechanical Engineering</Typography>
            <Typography component="li">Computer Science & Software</Typography>
          </ul>
        </Box>
        <Box sx={{ mt: 3, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Note: We do not currently handle patents in chemical, biological, or pharmaceutical fields.
          </Typography>
        </Box>
      </Paper>

      {/* Pricing Section */}
      <Paper sx={{ p: 4, mb: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Simple, Transparent Pricing
        </Typography>
        <Typography variant="h3" component="div" sx={{ color: 'primary.main', my: 3 }}>
          $500
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Flat rate for inventions with up to 6 features
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/submit')}
          sx={{ mt: 3 }}
        >
          Get Started Now
        </Button>
      </Paper>
    </Box>
  );
};

export default LandingPage;
