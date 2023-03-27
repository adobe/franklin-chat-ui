import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, TextField, Button} from '@adobe/react-spectrum';

import { useMagicAuth } from './auth/useMagicAuth';

export default function Login() {
  const navigate = useNavigate();
  const [authing, setAuthing] = useState(false);

  const {
    login,
  } = useMagicAuth();
  
  const handleSubmit = async (e: any) => {
    setAuthing(true);
    if (e.target)  {
      console.log('handleSubmit', e);
      const email = new FormData(e.target.closest('form')).get('email') as string;
      console.log('email', email);
      if (email) {
        await login({ email, showUI: true }) as string;
        setAuthing(false);
        navigate('/');
      }
    }
  }
  
  return (
    <div>
      <Form>
        <TextField type="email" name="email" label="Business email"/>
        <Button variant="primary" onPress={(e) => { handleSubmit(e as any); }} isDisabled={authing}>Login</Button>
      </Form>
    </div>
  );
};
