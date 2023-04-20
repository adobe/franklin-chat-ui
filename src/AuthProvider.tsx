import React, {PropsWithChildren, useContext, useEffect, useMemo} from 'react';
import {Magic} from 'magic-sdk';
import Login from './Login';
import {BusySpinner} from './BusySpinner';

const REACT_MAGIC_LINK_API_KEY = process.env.REACT_APP_MAGIC_LINK_API_KEY as string;
console.log(`Using Magic Link key: ${REACT_MAGIC_LINK_API_KEY}`);

type AuthClient = {
  login: (email: string) => Promise<void>
  logout: () => Promise<void>
  getToken: () => string|null
}

export const AuthContext = React.createContext<AuthClient|undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({children}) => {
  const [state, setState] = React.useState<{token: string|null, loading: boolean}>({token: null, loading: true});
  const magic = useMemo(() => new Magic(REACT_MAGIC_LINK_API_KEY), []);

  const authClient = useMemo(() => {
    return {
      login: async (email: string) => {
        try {
          console.log(`Trying to login with email: ${email}`);
          setState({token: state.token, loading: true});
          const token = await magic.auth.loginWithMagicLink({email});
          setState({token, loading: false});
          console.log(`Logged in with email: ${email}`, JSON.stringify(token));
        } catch (e) {
          console.error(`Failed to login with email: ${email}`, e);
          setState({token: state.token, loading: false});
        }
      },
      logout: async () => {
        try {
          console.log(`Trying to logout`);
          setState({token: state.token, loading: true})
          await magic.user.logout();
          setState({token: null, loading: false})
          console.log(`Logged out`);
        } catch (e) {
          console.error(`Failed to logout`, e);
          setState({token: state.token, loading: false});
        }
      },
      getToken: () => {
        return state.token;
      }
    }
  }, [magic.auth, magic.user, state.token]);

  useEffect(() => {
    magic.user.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        console.log(`Logged in. Refreshing token...`);
        magic.user.getIdToken().then((token) => {
          console.log(`Fresh token: ${token}`);
          setState({token, loading: false});
        });
        return;
      }
      console.log(`Not logged in`);
      setState({token: null, loading: false});
      });
  }, [magic.user]);

  return (
    <AuthContext.Provider value={authClient}>
      {state.loading ? <BusySpinner text='Authenticating...'/> : (state.token ? <>{children}</> : <Login/>)}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext was used outside of its Provider');
  }
  return context;
};
