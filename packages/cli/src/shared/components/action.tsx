import { Text } from 'ink';
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store.js';

interface Props {
  index: number;
  children?: React.ReactNode;
}

export default function Action({ index, children }: Props) {
  const cursor = useSelector<RootState>((state) => state.cursor.value);

  return (
    <Text underline color={cursor === index ? 'green' : 'white'}>
      {children}
    </Text>
  );
}
