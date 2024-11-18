import { Dispatch, SetStateAction } from 'react';

import { MenuItem } from '../interfaces/menu-item.js';
import { isNotEmpty } from './is-not-empty.js';
import { isNull } from './is-null.js';

export function addBack(
  menus: MenuItem[],
  setItems: Dispatch<SetStateAction<MenuItem[]>>,
): void {
  addBackRecursively(menus, null, null, setItems);
}

function addBackRecursively(
  menus: MenuItem[],
  parent: MenuItem | null,
  grandParent: MenuItem | null,
  setItems: Dispatch<SetStateAction<MenuItem[]>>,
): void {
  const back: MenuItem = {
    name: isNull(grandParent) ? 'Exit' : 'Back',
    onSelect: isNull(grandParent)
      ? () => {
          process.exit(0);
        }
      : () => {
          setItems(grandParent?.children || []);
        },
  };

  menus.push(back);

  menus.forEach((menu) => {
    if (isNotEmpty(menu.children)) {
      addBackRecursively(menu.children, menu, parent, setItems);
    }
  });
}
