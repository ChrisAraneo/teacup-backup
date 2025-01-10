import { Text, useInput } from 'ink';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store.js';

interface Props {
  index: number;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function CheckBox(props: Props) {
  const { index, onChange } = props;
  const [active, setActive] = useState<boolean>(false);
  const [isLastKeyReturn, setIsLastKeyReturn] = useState<boolean>(false);

  const cursor = useSelector<RootState>((state) => state.cursor.value);

  useInput((char, key) => {
    if (key.return && cursor === index && !active) {
      setActive(true);
      return;
    } else if (!active) {
      return;
    }

    if (key.return && !isLastKeyReturn) {
      onChange(!props.value);
      setIsLastKeyReturn(true);
    } else if (key.return && isLastKeyReturn) {
      setActive(false);
      setIsLastKeyReturn(false);
      return;
    }

    if (key.upArrow || key.downArrow || key.escape) {
      setActive(false);
      setIsLastKeyReturn(false);
      return;
    }

    if (key.backspace || key.delete) {
      onChange(false);
    } else if (char || key.leftArrow || key.rightArrow) {
      onChange(!props.value);
    }
  });

  return (
    <Text
      color={active ? 'yellow' : cursor === index ? '' : 'white'}
      backgroundColor={cursor === index && !active ? 'white' : ''}>
      <Text>{'['}</Text>
      {props.value ? (
        <Text inverse={active}>{'X'}</Text>
      ) : (
        <Text inverse={active}> </Text>
      )}
      <Text>{']'}</Text>
    </Text>
  );
}
