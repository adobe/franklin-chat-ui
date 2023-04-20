import React, {PropsWithChildren, useContext, useEffect, useMemo} from 'react';
import {Magic} from 'magic-sdk';
import Login from './Login';
import {BusySpinner} from './BusySpinner';

const REACT_MAGIC_LINK_API_KEY = process.env.REACT_APP_MAGIC_LINK_API_KEY as string;
console.log(`Using Magic Link key: ${REACT_MAGIC_LINK_API_KEY}`);

type AuthClient = {
  login: (email: string) => Promise<void>
  logout: () => Promise<void>
  getToken: () => Promise<string>
}

export const AuthContext = React.createContext<AuthClient|undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({children}) => {
  const [state, setState] = React.useState<{isLoggedIn: boolean, loading: boolean}>({isLoggedIn: false, loading: true});
  const magic = useMemo(() => new Magic(REACT_MAGIC_LINK_API_KEY), []);

  const authClient = useMemo(() => {
    return {
      login: async (email: string) => {
        setState({isLoggedIn: state.isLoggedIn, loading: true});
        const res = await magic.auth.loginWithMagicLink({email});
        console.log(`loginWithMagicLink: ${JSON.stringify(res)}`);
        setState({isLoggedIn: true, loading: false});
      },
      logout: async () => {
        setState({isLoggedIn: state.isLoggedIn, loading: true})
        await magic.user.logout();
        setState({isLoggedIn: false, loading: false})
      },
      getToken: () => {
        return magic.user.getIdToken();
      }
    }
  }, [magic.auth, magic.user, state.isLoggedIn]);

  useEffect(() => {
    setState({isLoggedIn: false, loading: true})
    magic.user.isLoggedIn().then((isLoggedIn) => {
      console.log(`isLoggedIn: ${isLoggedIn}`);
      setState({isLoggedIn, loading: false});
    });
  }, [magic.user]);

  return (
    <AuthContext.Provider value={authClient}>
      {state.loading ? <BusySpinner text='Authenticating...'/> : (state.isLoggedIn ? <>{children}</> : <Login/>)}
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
