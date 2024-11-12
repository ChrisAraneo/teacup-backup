import { Text } from 'ink';
import React from 'react';

interface Props {
  name: string | undefined;
}

export default function App({ name = 'Stranger' }: Props) {
  return (
    <Text>
      Hello, <Text color='green'>{name}</Text>
    </Text>
  );
}
