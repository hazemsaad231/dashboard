import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }:any) {

  const isLoggedIn = localStorage.getItem('token')==null;

  return isLoggedIn ? <Navigate to="/" />: children ;

}

export default PrivateRoute;