import {useMemo, useState} from 'react';
import {Form, TextField, Button, Checkbox, Flex, ButtonGroup} from '@adobe/react-spectrum';

import {useAuthContext} from './AuthProvider';

export default function Login() {
  const {login} = useAuthContext();

  const [email, setEmail] = useState('');

  let isValid = useMemo(
    () => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email),
    [email]
  );

  const onLogin = async () => {
    console.log(`onLogin: ${email}`);
    await login(email);
  }

  return (
    <Flex justifyContent='center' alignItems='center' height='100%'>
      <Form width='300px'>
        <h2>Log into Franklin Chat</h2>
        <TextField label="Your Business E-Mail" value={email} onChange={setEmail} validationState={isValid ? 'valid' : 'invalid'} />
        <ButtonGroup marginTop={25}>
          <Button variant="primary" onPress={onLogin} isDisabled={!email.trim().length}>Login</Button>
        </ButtonGroup>
      </Form>
    </Flex>
  );
};
