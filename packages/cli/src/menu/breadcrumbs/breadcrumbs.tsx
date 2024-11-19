import { Text } from 'ink';
import React from 'react';

import { MenuItem } from '../../interfaces/menu-item.js';
import { addBreadcrumbs } from './add-breadcrumbs.js';

interface Props {
  items: MenuItem[];
  selected: number;
}

export default function Breadcrumbs({ items, selected }: Props) {
  const selectedItem = addBreadcrumbs(items)[selected];

  if (!selectedItem) {
    return <></>;
  }

  const breadcrumbs = selectedItem?.breadcrumbs || [];

  return (
    <Text>
      {breadcrumbs.map((breadcrumb: string, index: number, array: string[]) => (
        <Text
          key={breadcrumb}
          color={index < array.length - 1 ? 'gray' : 'white'}>
          {breadcrumb}
          {index < array.length - 1 ? ' » ' : ''}
        </Text>
      ))}
    </Text>
  );
}
