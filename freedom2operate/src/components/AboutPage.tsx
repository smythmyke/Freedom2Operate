import { Box, Typography, Paper, Grid, Avatar } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import TimerIcon from '@mui/icons-material/Timer';
import SecurityIcon from '@mui/icons-material/Security';

const AboutPage = () => {
  return (
    <Box sx={{ maxWidth: '100%', px: { xs: 2, sm: 4, md: 6 }, py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 700 }}>
        About Us
      </Typography>

      {/* Mission Statement */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Our Mission
        </Typography>
        <Typography paragraph>
          At Freedom2Operate, our mission is to provide inventors and businesses with comprehensive, 
          reliable patent search services that enable informed decision-making in their innovation journey.
          We believe in making professional patent analysis accessible and transparent.
        </Typography>
      </Paper>

      {/* Core Values */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <VerifiedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Accuracy
            </Typography>
            <Typography color="text.secondary">
              We maintain the highest standards of precision in our patent searches and analyses
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <TimerIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Efficiency
            </Typography>
            <Typography color="text.secondary">
              Quick turnaround times without compromising on quality
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Confidentiality
            </Typography>
            <Typography color="text.secondary">
              Your intellectual property is protected with enterprise-grade security
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Team Section */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Our Team
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                MS
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Michael Smith
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Lead Patent Analyst
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                5 years experience in patent analysis and prosecution
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Mechanical Engineer, OU 2008
              </Typography>
              <Typography variant="body2">
                Tomahawk AUR Engineer, NSWC PHD (8 years)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                EJ
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Emily Johnson
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Technical Director
              </Typography>
              <Typography variant="body2">
                Expert in electrical engineering and software patents
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                RD
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Robert Davis
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Mechanical Patent Specialist
              </Typography>
              <Typography variant="body2">
                Specialized in mechanical and manufacturing patents
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Company History */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Our History
        </Typography>
        <Typography paragraph>
          Founded in 2020, Freedom2Operate emerged from the recognition that many inventors 
          and small businesses struggle to access professional patent search services at reasonable costs.
          Our team of experienced patent professionals came together with a shared vision of making 
          high-quality patent analysis more accessible.
        </Typography>
        <Typography paragraph>
          Since our inception, we have helped hundreds of clients navigate the complex landscape of 
          patent rights, enabling them to make informed decisions about their innovations and business strategies.
          Our commitment to excellence and client satisfaction has made us a trusted partner in the 
          intellectual property community.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AboutPage;
