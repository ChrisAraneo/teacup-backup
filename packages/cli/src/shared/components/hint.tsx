import { Text } from 'ink';
import React from 'react';

export default function Hint() {
  return (
    <Text color='gray'>
      Hint: use the <Text bold>↑</Text>, <Text bold>↓</Text> and{' '}
      <Text bold>Enter</Text> keys to navigate.
    </Text>
  );
}
