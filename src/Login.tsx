import React, {useState} from 'react';
import {
  Form,
  TextField,
  Button,
  Flex,
  ButtonGroup,
  Heading,
  Image,
  Content,
  ContextualHelp
} from '@adobe/react-spectrum';
import logo from './logo.png';

import {useAuthContext} from './AuthProvider';

export default function Login() {
  const {login} = useAuthContext();

  const [email, setEmail] = useState('');

  const onLogin = async () => {
    console.log(`onLogin: ${email}`);
    await login(email);
  }

  return (
    <Flex justifyContent='center' alignItems='center' height='100%'>
      <div style={{borderRadius: 25, border: '1px solid #ccc', padding: 10, boxShadow: '0 0 3px #ccc'}}>
      <Form width='300px' onSubmit={onLogin} margin={35}>
        <Flex direction="row" alignItems="center" gap={10} marginBottom={35}>
          <Image src={logo} width={64} height={64} alt="Logo"/>
          <Flex direction="column">
            <Heading level={2} margin={0}>Adobe Support</Heading>
            <Heading level={4} margin={0}>We are here to help!</Heading>
          </Flex>
        </Flex>
        <TextField label="Enter your business email address" value={email} onChange={setEmail} width='300px' isQuiet contextualHelp={
          <ContextualHelp>
            <Content>
              To begin chatting, simply enter your business email address,
              click on the "Login" button, open the email you received,
              click on the provided link, and enjoy chatting with our friendly support team.
            </Content>
          </ContextualHelp>
        }/>
        <ButtonGroup marginTop={25}>
          <Button variant="primary" type='submit' isDisabled={!email.trim().length}>Login</Button>
        </ButtonGroup>
      </Form>
      </div>
    </Flex>
  );
};
