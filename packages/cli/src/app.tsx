import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';

import { addBack } from './functions/add-back.js';
import { isNotEmpty } from './functions/is-not-empty.js';
import { MenuItem } from './interfaces/menu-item.js';
import Menu from './menu/menu.js';

interface Props {
  root: MenuItem;
}

export default function App({ root }: Props) {
  const [items] = useState<MenuItem[]>([root]);
  const [transformedItems, setTransformedItems] = useState<MenuItem[]>([]);
  const [active, setActive] = useState<MenuItem | undefined>();

  useEffect(() => {
    const itemsWithBack = addBack(items, (item) => setActive(item));

    if (isNotEmpty<MenuItem>(itemsWithBack)) {
      setTransformedItems(itemsWithBack);
      setActive(itemsWithBack[0]);
    }
  }, [items]);

  return (
    <Box flexDirection='column'>
      <Text>
        🍵 Teacup Backup <Text color='gray'>(v0.5.3)</Text>
      </Text>
      {active && (
        <Menu
          active={active}
          items={transformedItems}
          activate={(item) => setActive(item)}></Menu>
      )}
    </Box>
  );
}
