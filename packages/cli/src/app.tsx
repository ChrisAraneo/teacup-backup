import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';

import { addBack } from './functions/add-back.js';
import { isNotEmpty } from './functions/is-not-empty.js';
import { MenuItem } from './interfaces/menu-item.js';
import Breadcrumbs from './menu/breadcrumbs/breadcrumbs.js';
import Hint from './menu/hint/hint.js';
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
    <Box
      borderStyle={'single'}
      borderColor={'gray'}
      padding={1}
      flexDirection='column'
      rowGap={1}
      width={80}
      minHeight={30}>
      <Text>
        🍵 Teacup Backup <Text color='gray'>(v0.5.3)</Text>
      </Text>
      <Hint></Hint>
      {active && (
        <Breadcrumbs items={transformedItems} active={active}></Breadcrumbs>
      )}
      {active && <Text>{active.description}</Text>}
      {active && (
        <Menu active={active} activate={(item) => setActive(item)}></Menu>
      )}
    </Box>
  );
}
