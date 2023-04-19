import React, {PropsWithChildren, useContext, useEffect} from 'react';

import {ChatClient} from './ChatClient';
import {useAuthContext} from './AuthProvider';
import {BusySpinner} from './BusySpinner';

function createApplication(token: string) {
  console.log(`createApplication: ${token}`);
  const chatClient = new ChatClient(token);
  return {
    chatClient,
  };
}

export type Application = ReturnType<typeof createApplication>;

export const ApplicationContext = React.createContext<Application|undefined>(undefined);

export const ApplicationProvider: React.FC<PropsWithChildren> = ({children}) => {
  const {getToken} = useAuthContext();
  const [application, setApplication] = React.useState<Application|undefined>(undefined);

  useEffect(() => {
    getToken().then((token) => {
      setApplication(createApplication(token));
    });
  }, [getToken]);

  if (application) {
    return (
      <ApplicationContext.Provider value={application}>
        {children}
      </ApplicationContext.Provider>
    );
  }
  return <BusySpinner text='Authenticating...'/>;
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext was used outside of its Provider');
  }
  return context;
};
