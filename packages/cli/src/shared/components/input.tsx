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

  return (
    <Text
      color={active ? 'yellow' : cursor === index ? '' : 'white'}
      backgroundColor={cursor === index && !active ? 'white' : ''}>
      {text.split('').map((char, i) => {
        if (i !== inputCursor) {
          return <Text key={char + i}>{char}</Text>;
        } else if (active) {
          return (
            <Text key={char + i} inverse>
              {char}
            </Text>
          );
        } else {
          return <></>;
        }
      })}
      {cursor === index && active && inputCursor >= text.length && (
        <Text inverse> </Text>
      )}
      {text.length === 0 && cursor === index && !active
        ? 'Enter to write value'
        : ''}
    </Text>
  );
}
