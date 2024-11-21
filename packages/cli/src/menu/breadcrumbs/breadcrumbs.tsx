import { Text } from 'ink';
import React, { useEffect, useState } from 'react';

import { findMenuItem } from '../../functions/find-menu-item.js';
import { BreadcrumbsMenuItem } from '../../interfaces/breadcrumbs-menu-item.js';
import { MenuItem } from '../../interfaces/menu-item.js';
import { addBreadcrumbs } from './add-breadcrumbs.js';

interface Props {
  active: MenuItem;
  items: MenuItem[];
}

export default function Breadcrumbs({ active, items }: Props) {
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    const breadcrumbItems = addBreadcrumbs(items);
    const found = findMenuItem(breadcrumbItems, active) as
      | BreadcrumbsMenuItem
      | undefined;

    if (found) {
      setBreadcrumbs(found.breadcrumbs);
      setName(found.name);
    }
  }, [items, active]);

  return (
    <Text>
      {breadcrumbs.map((breadcrumb: string) => (
        <Text key={breadcrumb} color='gray'>
          {breadcrumb + ' » '}
        </Text>
      ))}
      <Text color='white'>{name}</Text>
    </Text>
  );
}
