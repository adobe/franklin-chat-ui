// from https://github.com/ScottyMJacobson/magic-auth-context
import React from 'react';

import { MagicAuthContext, MagicAuthContextProps } from './MagicAuthContext';

export const useMagicAuth = (): MagicAuthContextProps => {
  const context = React.useContext<MagicAuthContextProps>(MagicAuthContext);

  if (!context) {
    throw new Error(
      'MagicAuthProvider context is undefined, please verify you are calling useMagicAuth() as child of a <MagicAuthProvider> component.'
    );
  }

  return context;
};