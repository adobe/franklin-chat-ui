// from https://github.com/ScottyMJacobson/magic-auth-context
import React from 'react';
import {
  LoginWithMagicLinkConfiguration,
  MagicUserMetadata,
} from '@magic-sdk/types';

export interface MagicAuthContextProps {
  login: (config: LoginWithMagicLinkConfiguration) => Promise<string | null>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  metadata: MagicUserMetadata | null;
  attemptingReauthentication: boolean;
  token: string | null;
}

export const MagicAuthContext = React.createContext<MagicAuthContextProps>(
  undefined as any
);
MagicAuthContext.displayName = 'MagicAuthContext';