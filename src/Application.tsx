import React, {Fragment, PropsWithChildren, useContext, useMemo} from 'react';
import {defaultTheme, Provider} from '@adobe/react-spectrum';

import {ChatClient} from './ChatClient';

function createApplication() {
  const chatClient = new ChatClient();
  return {
    chatClient,
  };
}

export type Application = ReturnType<typeof createApplication>;

export const ApplicationContext = React.createContext<Application|undefined>(undefined);

export const ApplicationProvider: React.FC<PropsWithChildren> = ({children}) => {
  const application = useMemo(createApplication, []);

  if (!application) {
    return (<Fragment />);
  }

  return (
    <Provider theme={defaultTheme} colorScheme="dark" height="100%">
      <ApplicationContext.Provider value={application}>
        {children}
      </ApplicationContext.Provider>
    </Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext was used outside of its Provider');
  }
  return context;
};