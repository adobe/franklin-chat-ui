import {useMemo, useState} from 'react';
import {Form, TextField, Button, Flex, ButtonGroup, Heading, Well} from '@adobe/react-spectrum';

import {useAuthContext} from './AuthProvider';

export default function Login() {
  const {login} = useAuthContext();

  const [email, setEmail] = useState('');

  let isValid = useMemo(
    () => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email),
    [email]
  );

  const onLogin = async () => {
    console.log(`onLogin: ${email}`);
    await login(email);
  }

  return (
    <Flex justifyContent='center' alignItems='center' height='100%'>
      <Form width='500px' onSubmit={onLogin} validationState={isValid ? 'valid' : 'invalid'} >
        <Heading level={2}>Log into Franklin Chat</Heading>
        <Well marginBottom={10}>
          <ol style={{margin: 10, padding: 0}}>
            <li>Enter your business email address and click on the "Login" button</li>
            <li>Open the email you received and click on the link</li>
            <li>Go back to the app and start chatting</li>
          </ol>
        </Well>
        <TextField label="Your Business E-Mail" value={email} onChange={setEmail} isRequired width='300px'/>
        <ButtonGroup marginTop={25}>
          <Button variant="primary" type='submit' isDisabled={!email.trim().length}>Login</Button>
        </ButtonGroup>
      </Form>
    </Flex>
  );
};
