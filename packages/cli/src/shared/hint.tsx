import { Text } from 'ink';
import React from 'react';

export default function Hint() {
  return (
    <Text color='gray'>
      Hint: use the <Text color='yellow'>↑</Text>, <Text color='yellow'>↓</Text>{' '}
      and <Text color='yellow'>Enter</Text> keys to navigate.
    </Text>
  );
}
