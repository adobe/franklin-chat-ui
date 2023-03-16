import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMagicAuth } from './useMagicAuth';

export interface IAuthRouteProps {
    children: React.ReactNode;
}

const AuthRoute: React.FunctionComponent<IAuthRouteProps> = (props) => {
  const { children } = props;
  
  const {
    isLoggedIn,
  } = useMagicAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace/>;
  }
            
  return <>{children}</>;
};

export default AuthRoute;