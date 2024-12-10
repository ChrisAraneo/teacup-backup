import React, { useEffect, useState } from 'react';

import Input from './input.js';

interface Props {
  index: number;
  value: number;
  onChange: (value: number) => void;
}

export default function NumberInput(props: Props) {
  const { index, onChange } = props;
  const [value, setValue] = useState<number>(props.value);

  useEffect(() => {
    // TODO Handle non digit symbol
    onChange(+value);
  }, [value]);

  return (
    <Input
      index={index}
      value={`${value}`}
      onChange={(value) => {
        // TODO Handle non digit symbol
        setValue(+value);
      }}></Input>
  );
}
