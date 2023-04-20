import React, {PropsWithChildren, useContext} from 'react';

import {ChatClient} from './ChatClient';
import {useAuthContext} from './AuthProvider';

function createApplication(token: string) {
  console.log(`createApplication: ${token}`);
  const chatClient = new ChatClient(token);
  return {
    chatClient
  };
}

export type Application = ReturnType<typeof createApplication>;

export const ApplicationContext = React.createContext<Application|undefined>(undefined);

export const ApplicationProvider: React.FC<PropsWithChildren> = ({children}) => {
  const {getToken} = useAuthContext();
  const application = createApplication(getToken() as string);
  return (
    <ApplicationContext.Provider value={application}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext was used outside of its Provider');
  }
  return context;
};
