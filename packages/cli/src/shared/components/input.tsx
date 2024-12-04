import { Text, useInput } from 'ink';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store.js';

interface Props {
  index: number;
  value: string;
  onChange: (text: string) => void;
}

export default function Input({ index, value, onChange }: Props) {
  const [text, setText] = useState<string>(value);
  const [active, setActive] = useState<boolean>(false);
  const cursor = useSelector<RootState>((state) => state.cursor.value);

  useInput((char, key) => {
    if (cursor !== index && active) {
      setActive(false);
      return;
    } else if (cursor !== index) {
      return;
    }

    if (key.return) {
      setActive(!active);
    } else if (key.downArrow || key.upArrow || key.escape) {
      setActive(false);
    } else if (key.backspace) {
      setText(text.slice(0, text.length - 2));
    } else {
      setText(text + char);
    }
  });

  useEffect(() => {
    onChange(text);
  }, [text]);

  return (
    <Text
      color={active ? 'yellow' : cursor === index ? '' : 'white'}
      backgroundColor={cursor === index && !active ? 'white' : ''}>
      {text.length > 0
        ? text
        : cursor === index && !active
          ? 'Enter to write value'
          : ''}
    </Text>
  );
}
