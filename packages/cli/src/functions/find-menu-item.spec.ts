import test from 'ava';

import { MenuItem } from '../interfaces/menu-item.js';
import { findMenuItem } from './find-menu-item.js';

const menuItems: MenuItem[] = [
  {
    name: 'Home',
  },
  { name: 'Second test', children: [{ name: 'Test two' }] },
  {
    name: "It's a test",
    children: [{ name: 'Test', children: [{ name: 'Test 2' }] }],
  },
  {
    name: "It's a test too",
    children: [
      {
        name: 'Test',
        children: [{ name: 'Test 2', children: [{ name: 'Test' }] }],
      },
      { name: 'Second child' },
    ],
  },
  {
    name: 'Fruits',
    children: [
      { name: 'Kiwis' },
      {
        name: 'Watermelons',
        children: [
          {
            name: 'Apples',
            children: [{ name: 'Bananas' }, { name: 'Pears' }],
          },
        ],
      },
    ],
  },
  { name: 'Vegetables' },
];

test('should find top-level item', (t) => {
  const searched: MenuItem = { name: 'Home' };

  const result = findMenuItem(menuItems, searched);

  t.deepEqual(result, { name: 'Home' });
});

test('should find nested item', (t) => {
  const searched: MenuItem = { name: 'Test two' };

  const result = findMenuItem(menuItems, searched);

  t.deepEqual(result, { name: 'Test two' });
});

test('should return undefined when item is not found', (t) => {
  const searched: MenuItem = { name: 'Bananas', children: [] };

  const result = findMenuItem(menuItems, searched);

  t.is(result, undefined);
});

test('should find deeply nested item', (t) => {
  const searched: MenuItem = { name: 'Pears' };

  const result = findMenuItem(menuItems, searched);

  t.deepEqual(result, { name: 'Pears' });
});

test('should work with items with no children', (t) => {
  const searched: MenuItem = { name: 'Vegetables' };

  const result = findMenuItem(menuItems, searched);

  t.deepEqual(result, { name: 'Vegetables' });
});

test('should find item with children when searching for a matching nested structure', (t) => {
  const searched: MenuItem = {
    name: 'Watermelons',
    children: [
      {
        name: 'Apples',
        children: [{ name: 'Bananas' }, { name: 'Pears' }],
      },
    ],
  };

  const result = findMenuItem(menuItems, searched);

  t.is(result, {
    name: 'Watermelons',
    children: [
      {
        name: 'Apples',
        children: [{ name: 'Bananas' }, { name: 'Pears' }],
      },
    ],
  });
});
