import { Typography, Container, Box } from '@mui/material'

const StudentDashboard = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Student Dashboard</Typography>
        <Typography>Attendance, assignments, results, timetable, fees</Typography>
        <Typography color="text.secondary">To be implemented in Phase 2</Typography>
      </Box>
    </Container>
  )
}

export default StudentDashboard
