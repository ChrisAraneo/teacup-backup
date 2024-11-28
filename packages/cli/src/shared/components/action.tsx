import { Text, useInput } from 'ink';
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store.js';

interface Props {
  index: number;
  onSelect: () => void;
  children?: React.ReactNode;
}

export default function Action({ index, children, onSelect }: Props) {
  const cursor = useSelector<RootState>((state) => state.cursor.value);

  useInput((_, key) => {
    if (cursor === index && key.return) {
      onSelect();
    }
  });

  return (
    <Text
      color={cursor === index ? '' : 'white'}
      backgroundColor={cursor === index ? 'white' : ''}>
      {children}
    </Text>
  );
}
