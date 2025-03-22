import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#117398', // Darker Blue
      light: '#4295b8', // Light Blue
      dark: '#0b587a', // Very Dark Blue
    },
    secondary: {
      main: '#12a38e', // Adjusted Teal to match darker blue
      light: '#58d4c0', // Light Teal
      dark: '#007566', // Dark Teal
    },
    background: {
      default: '#ecf5fa', // Base blue-gray
      paper: '#f5f9fc',   // Lighter shade for paper
    },
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(17, 115, 152, 0.12)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(17, 115, 152, 0.95)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(17, 115, 152, 0.08)',
          borderRadius: 16,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(17, 115, 152, 0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&.MuiButton-containedPrimary': {
            boxShadow: '0 4px 12px rgba(17, 115, 152, 0.2)',
            '&:hover': {
              backgroundColor: '#0d628a',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(17, 115, 152, 0.25)',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(17, 115, 152, 0.08)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(17, 115, 152, 0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          '&.MuiChip-colorSecondary': {
            boxShadow: '0 2px 8px rgba(18, 163, 142, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.2s ease',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#0d5272', // Adjusted text color to match new primary
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
      color: '#0d5272', // Adjusted text color to match new primary
      letterSpacing: '0.25px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(17, 115, 152, 0.05)',
    '0 4px 8px rgba(17, 115, 152, 0.08)',
    '0 6px 12px rgba(17, 115, 152, 0.1)',
    // ... add more shadow definitions as needed
  ],
});

export default theme;