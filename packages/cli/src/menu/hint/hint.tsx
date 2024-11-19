import { Text } from 'ink';
import React from 'react';

export default function Hint() {
  return (
    <Text color='gray'>
      Hint: Select an option using <Text color='yellow'>↑</Text> and{' '}
      <Text color='yellow'>↓</Text> keys, press{' '}
      <Text color='yellow'>Enter</Text> to select:
    </Text>
  );
}
