import React, {Fragment, PropsWithChildren, useContext, useMemo} from 'react';
import {ChatClient} from './ChatClient';

function createApplication() {
  const chatClient = new ChatClient();
  return {
    chatClient
  };
}

export type Application = ReturnType<typeof createApplication>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Application = React.createContext<Application|undefined>(undefined);

export const ApplicationProvider: React.FC<PropsWithChildren> = ({children}) => {
  const application = useMemo(createApplication, []);

  if (!application) {
    return (<Fragment />);
  }

  return (
    <Application.Provider value={application}>
      {children}
    </Application.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(Application);
  if (context === undefined) {
    throw new Error('useApplicationContext was used outside of its Provider');
  }
  return context;
};
