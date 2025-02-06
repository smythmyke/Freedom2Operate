import { Box, Typography, Paper, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import TextLogo from './TextLogo';
import CodeIcon from '@mui/icons-material/Code';
import MemoryIcon from '@mui/icons-material/Memory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TechnicalExpertisePage = () => {
  return (
    <Box sx={{ maxWidth: '100%', px: { xs: 2, sm: 4, md: 6 }, py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 700 }}>
        Technical Expertise
      </Typography>

      {/* Overview */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Our Technical Capabilities
        </Typography>
        <Typography paragraph>
          Our team brings extensive experience in patent analysis across various technical fields.
          We specialize in conducting thorough <TextLogo /> (FTO) searches in the following
          areas of technology.
        </Typography>
      </Paper>

      {/* Main Areas */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CodeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Software & Computing
              </Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Artificial Intelligence & Machine Learning" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Cloud Computing & Distributed Systems" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Mobile Applications & Web Technologies" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Cybersecurity & Encryption" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <MemoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Electrical Engineering
              </Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Semiconductor Devices & Circuits" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Wireless Communication Systems" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Power Electronics & Control Systems" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="IoT & Embedded Systems" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PrecisionManufacturingIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Mechanical Engineering
              </Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Manufacturing Processes & Equipment" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Robotics & Automation" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Consumer Products & Mechanisms" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Industrial Equipment & Tools" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Search Process */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Our Search Process
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Comprehensive Database Coverage
            </Typography>
            <Typography paragraph>
              We conduct thorough searches across multiple patent databases including:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="USPTO Patent Database" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="European Patent Office (EPO)" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="World Intellectual Property Organization (WIPO)" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Lens.org" 
                  secondary="Advanced patent analytics and scholarly works platform"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Technical Analysis
            </Typography>
            <Typography paragraph>
              Our analysis includes:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Detailed feature-by-feature comparison" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Assessment of technical equivalents" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Identification of potential workarounds" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Quality Assurance */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quality Assurance
        </Typography>
        <Typography paragraph>
          Every search undergoes a rigorous quality assurance process:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Multi-Level Review" 
              secondary="Each search is reviewed by at least two technical experts"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Comprehensive Documentation" 
              secondary="Detailed search strategies and analysis methods are documented"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Regular Updates" 
              secondary="Search strategies are regularly updated to reflect the latest patent office practices"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default TechnicalExpertisePage;
