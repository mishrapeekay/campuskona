import { Typography, Container, Box } from '@mui/material'

const SchoolAdminDashboard = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">School Admin Dashboard</Typography>
        <Typography>Student management, staff, academics, reports</Typography>
        <Typography color="text.secondary">To be implemented in Phase 2</Typography>
      </Box>
    </Container>
  )
}

export default SchoolAdminDashboard
