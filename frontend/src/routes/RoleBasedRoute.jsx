import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

/**
 * RoleBasedRoute - Protects routes based on user role
 */
const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user?.user_type)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

RoleBasedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default RoleBasedRoute
