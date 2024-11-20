import { Text } from 'ink';
import React from 'react';

import { findMenuItem } from '../../functions/find-menu-item.js';
import { MenuItem } from '../../interfaces/menu-item.js';
import { addBreadcrumbs } from './add-breadcrumbs.js';

interface Props {
  active: MenuItem;
  items: MenuItem[];
}

export default function Breadcrumbs({ active, items }: Props) {
  const activeItemWithBreadcrumbs = findMenuItem(addBreadcrumbs(items), active);

  return (
    <Text>
      {(activeItemWithBreadcrumbs?.breadcrumbs || []).map((breadcrumb: string) => (
        <Text key={breadcrumb} color='gray'>
          {breadcrumb + ' » '}
        </Text>
      ))}
      <Text color='white'>{active.name}</Text>
    </Text>
  );
}
