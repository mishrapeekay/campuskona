import { Typography, Container, Box } from '@mui/material'

const TeacherDashboard = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Teacher Dashboard</Typography>
        <Typography>Attendance, assignments, grades, timetable</Typography>
        <Typography color="text.secondary">To be implemented in Phase 2</Typography>
      </Box>
    </Container>
  )
}

export default TeacherDashboard
