import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              height: '100%', 
              textAlign: 'center',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                '& .MuiSvgIcon-root': {
                  transform: 'scale(1.2) rotate(5deg)',
                  color: 'primary.dark'
                }
              }
            }}
          >
            <SearchIcon 
              className="MuiSvgIcon-root"
              sx={{ 
                fontSize: 48, 
                color: 'primary.main', 
                mb: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} 
            />
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                transition: 'color 0.3s ease-in-out',
                mb: 2
              }}
            >
              Comprehensive Search
            </Typography>
            <Typography 
              color="text.secondary"
              sx={{
                transition: 'color 0.3s ease-in-out'
              }}
            >
              4-8 hour thorough analysis of existing patents and publications using comprehensive public and private database tools
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={6}
            sx={{ 
              p: 3, 
              height: '100%', 
              textAlign: 'center',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                '& .MuiSvgIcon-root': {
                  transform: 'scale(1.2) rotate(5deg)',
                  color: 'primary.dark'
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: '#FFD700',
                borderRadius: '2px 2px 0 0'
              }
            }}
          >
            <AttachMoneyIcon 
              className="MuiSvgIcon-root"
              sx={{ 
                fontSize: 56, 
                color: 'primary.main', 
                mb: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} 
            />
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Flat Rate Pricing
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                mb: 1
              }}
            >
              $500
            </Typography>
            <Typography color="text.secondary">
              For inventions with up to 6 key features
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              height: '100%', 
              textAlign: 'center',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                '& .MuiSvgIcon-root': {
                  transform: 'scale(1.2) rotate(5deg)',
                  color: 'primary.dark'
                }
              }
            }}
          >
            <SecurityIcon 
              className="MuiSvgIcon-root"
              sx={{ 
                fontSize: 48, 
                color: 'primary.main', 
                mb: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} 
            />
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
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
          We conduct thorough searches across multiple patent databases including Google Patents, Google Scholar, 
          and specialized patent databases. Our comprehensive search covers both public published information 
          and patent documents to provide you with a clear understanding of the patent landscape around your invention.
        </Typography>
        <Typography paragraph>
          Each search typically takes 4-8 hours to complete, ensuring a thorough analysis of all relevant documents
          and potential conflicts.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            What's Included:
          </Typography>
          <ul>
            <Typography component="li">Comprehensive search across public and private patent databases</Typography>
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

      {/* Detailed Product Features */}
      <Paper sx={{ p: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Comprehensive Search Package
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Typography>
                <strong>Detailed Citations:</strong> Complete references to relevant patents and publications
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Typography>
                <strong>Machine Translations:</strong> Automatic translation of foreign patents
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Typography>
                <strong>Expert Analysis:</strong> Detailed observations and recommendations
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Typography>
                <strong>Feature Mapping:</strong> Clear correlation between your features and found art
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Typography>
                <strong>Search Strategy:</strong> Documented search methodology and keywords
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
              <Typography>
                <strong>Risk Assessment:</strong> Clear evaluation of potential conflicts
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Pricing Section */}
      <Paper sx={{ p: 4, mb: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Simple, Transparent Pricing
          </Typography>
          <Box sx={{ 
            bgcolor: 'success.light', 
            p: 3, 
            borderRadius: 2,
            mt: 3,
            mb: 4,
            display: 'inline-block',
            minWidth: '300px',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              cursor: 'pointer'
            }
          }}>
            <Typography variant="h3" component="div" sx={{ color: 'white' }}>
              $500
            </Typography>
            <Typography variant="h6" sx={{ color: 'white' }} gutterBottom>
              Flat Rate Package
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography>Up to 6 key features</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography>4-8 hour thorough analysis</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography>Comprehensive report</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography>Machine translations included</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography>Feature-by-feature analysis</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography>Risk assessment included</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            * For larger projects (more than 6 features), please visit our <Button 
              color="primary"
              onClick={() => navigate('/contact')}
              sx={{ textTransform: 'none', p: 0, minWidth: 'auto', verticalAlign: 'baseline' }}
            >
              Contact page
            </Button> for custom pricing.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/submit')}
            sx={{ mt: 2 }}
          >
            Get Started Now
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LandingPage;
