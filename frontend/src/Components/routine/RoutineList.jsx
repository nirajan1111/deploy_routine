import React from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';

// Sample data - replace with your API call

const RoutineList = ({groups}) => {
  const navigate = useNavigate();
  let {type }=useParams()
  console.log(type)
  if(type !=='rooms'){
    type='group'
  }
  console.log(type)

  const handleGroupClick = (group) => {
    // Store group info in localStorage
    if(type=='rooms'){
      localStorage.setItem('room',JSON.stringify(group))
    }else{
    localStorage.setItem('group', JSON.stringify(group));
    }
    navigate(`/routines/${type}/${group.id}`);
  };
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Class Routines
        </Typography>
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card 
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                minWidth: '200px',
                minHeight: '150px',
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: '#fff',
                borderRadius: '15px',
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
                },
              }}
              >
                <CardActionArea onClick={() => handleGroupClick(group)}>
                {/* 
                <CardMedia
                    component="img"
                    height="200"
                    image={group.image}
                    alt={group.name}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                  */}
                  <CardContent>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="div"
                      sx={{ 
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      {group.name}
                    </Typography>
                    <Typography 
                    gutterBottom 
                    variant="h5" 
                    component="div"
                    sx={{ 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize:'20px'
                    }}
                  >
                    {group.year_enrolled}{" "}{group.section}
                  </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default RoutineList; 