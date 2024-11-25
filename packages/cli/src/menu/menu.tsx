import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';

import { MenuItem } from '../interfaces/menu-item.js';

interface Props {
  active: MenuItem;
  activate: (item: MenuItem) => void;
}

export default function Menu({ active, activate }: Props) {
  const [selected, setSelected] = useState(0);

  useInput((_, key) => {
    const items = active?.children || [];

    if (key.upArrow) {
      setSelected((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : items.length - 1,
      );
    } else if (key.downArrow) {
      setSelected((prevIndex) =>
        prevIndex < items.length - 1 ? prevIndex + 1 : 0,
      );
    } else if (key.return && items[selected]) {
      activate(items[selected]);

      if (items[selected].onSelect) {
        items[selected].onSelect();
      }

      setSelected(0);
    }
  });

  return (
    <Box flexDirection='column'>
      {(active?.children || []).map((item, index) => (
        <Text key={item.name} color={index === selected ? 'green' : 'white'}>
          {index === selected ? '• ' : '  '}
          {`${index + 1}. ` + item?.name}
        </Text>
      ))}
    </Box>
  );
}
