import test from 'ava';

import { MenuItem } from '../../interfaces/menu-item.js';
import { addBreadcrumbs } from './add-breadcrumbs.js';

test('should add breadcrumbs to a nested menu structure', (t) => {
  const menus = [
    {
      name: 'Home',
      children: [
        { name: 'Dashboard' },
        {
          name: 'Settings',
          children: [
            {
              name: 'Profile',
              children: [
                { name: 'Edit', children: [] },
                { name: 'Delete profile' },
              ],
            },
            { name: 'Account' },
          ],
        },
      ],
    },
    { name: 'About' },
  ];

  addBreadcrumbs(menus);

  t.deepEqual(menus, [
    {
      name: 'Home',
      breadcrumbs: [],
      children: [
        { name: 'Dashboard', breadcrumbs: ['Home'] },
        {
          name: 'Settings',
          breadcrumbs: ['Home'],
          children: [
            {
              name: 'Profile',
              breadcrumbs: ['Home', 'Settings'],
              children: [
                {
                  name: 'Edit',
                  breadcrumbs: ['Home', 'Settings', 'Profile'],
                  children: [],
                },
                {
                  name: 'Delete profile',
                  breadcrumbs: ['Home', 'Settings', 'Profile'],
                },
              ],
            },
            { name: 'Account', breadcrumbs: ['Home', 'Settings'] },
          ],
        },
      ],
    },
    { name: 'About', breadcrumbs: [] },
  ]);
});

test('should handle an empty menu array', (t) => {
  const menus: MenuItem[] = [];

  addBreadcrumbs(menus);

  t.deepEqual(menus, []);
});

test('should add empty breadcrumbs to a flat menu structure', (t) => {
  const menus = [{ name: 'Home' }, { name: 'About' }, { name: 'Contact' }];

  addBreadcrumbs(menus);

  t.deepEqual(menus, [
    { name: 'Home', breadcrumbs: [] },
    { name: 'About', breadcrumbs: [] },
    { name: 'Contact', breadcrumbs: [] },
  ]);
});

test('should handle menus with empty children', (t) => {
  const menus = [
    { name: 'Home', children: [] },
    { name: 'About', children: [] },
  ];

  addBreadcrumbs(menus);

  t.deepEqual(menus, [
    { name: 'Home', breadcrumbs: [], children: [] },
    { name: 'About', breadcrumbs: [], children: [] },
  ]);
});

test('should overwrite existing breadcrumbs with correct values', (t) => {
  const menus = [
    {
      name: 'Home',
      breadcrumbs: ['Test'],
      children: [
        {
          name: 'Dashboard',
          breadcrumbs: ['Home', 'Test'],
        },
      ],
    },
  ];

  addBreadcrumbs(menus);

  t.deepEqual(menus, [
    {
      name: 'Home',
      breadcrumbs: [],
      children: [
        {
          name: 'Dashboard',
          breadcrumbs: ['Home'],
        },
      ],
    },
  ]);
});
