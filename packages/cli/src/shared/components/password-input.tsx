import { Text, useInput } from 'ink';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store.js';

interface Props {
  index: number;
  value: string;
  onChange: (text: string) => void;
}

export default function PasswordInput({ index, value, onChange }: Props) {
  const [text, setText] = useState<string>(value);
  const [inputCursor, setInputCursor] = useState<number>(0);
  const [active, setActive] = useState<boolean>(false);

  const cursor = useSelector<RootState>((state) => state.cursor.value);

  useInput((char, key) => {
    if (key.return && cursor === index && !active) {
      setActive(true);
      return;
    } else if (!active) {
      return;
    }

    if (key.return || key.upArrow || key.downArrow || key.escape) {
      setActive(false);
      return;
    }

    if (key.rightArrow) {
      setInputCursor(
        inputCursor >= text.length ? text.length : inputCursor + 1,
      );
    } else if (key.leftArrow) {
      setInputCursor(inputCursor > 0 ? inputCursor - 1 : 0);
    } else if (key.backspace && active) {
      setText(text.slice(0, inputCursor - 1) + text.slice(inputCursor));
      setInputCursor(inputCursor > 0 ? inputCursor - 1 : 0);
    } else if (key.delete && active) {
      setText(text.slice(0, inputCursor) + text.slice(inputCursor + 1));
    } else if (active) {
      setText(text.slice(0, inputCursor) + char + text.slice(inputCursor));
      setInputCursor(inputCursor + 1);
    }
  });

  useEffect(() => {
    onChange(text);
  }, [text]);

  if (active) {
    return (
      <Text color={'yellow'}>
        {text.split('').map((char, i) => (
          <Text key={char + i} inverse={i === inputCursor}>
            {'•'}
          </Text>
        ))}
        {cursor === index && inputCursor >= text.length && (
          <Text inverse> </Text>
        )}
      </Text>
    );
  } else {
    return (
      <Text
        color={cursor === index ? '' : 'white'}
        backgroundColor={cursor === index ? 'white' : ''}>
        {text.length === 0 && cursor === index
          ? 'Enter to write password'
          : active
            ? text
            : text
                .split('')
                .map(() => '•')
                .join('')}
      </Text>
    );
  }
}
