import React, {useEffect} from 'react';

export function ChatTitle({title, colorScheme}: {title: string, colorScheme: string}) {
  const [opacity, setOpacity] = React.useState(0);
  useEffect(() => {
    setOpacity(0);
    setTimeout(() => setOpacity(1), 100);
  }, [title]);
  console.log(colorScheme)
  return (
    <h3 style={{
      color: colorScheme === 'dark' ? 'white' : 'black', margin: 0, fontStyle: 'normal',
      opacity: opacity,
      transition: opacity ? 'all 1s' : 'none'}}>{title}</h3>
  );
}
