import { MenuItem } from '../interfaces/menu-item.js';
import { cloneDeep } from './clone-deep.js';
import { isNotEmpty } from './is-not-empty.js';
import { isNull } from './is-null.js';

export function addBack(
  items: MenuItem[],
  activate: (item: MenuItem) => void,
  exit: () => never = () => {
    process.exit(0);
  },
): MenuItem[] {
  const clone = cloneDeep(items);

  addBackRecursively(clone, null, null, activate, exit);

  return clone;
}

function addBackRecursively(
  menus: MenuItem[],
  parent: MenuItem | null,
  grandParent: MenuItem | null,
  activate: (item: MenuItem) => void,
  exit: () => never,
  isLast = false,
): void {
  const back: MenuItem = {
    name: isNull(grandParent) ? 'Exit' : 'Back',
    onSelect: isNull(grandParent)
      ? () => exit()
      : () => {
          activate(grandParent);
        },
  };

  menus.push(back);

  menus.forEach((menu) => {
    if (isNotEmpty(menu.children)) {
      addBackRecursively(menu.children, menu, parent, activate, exit);
    } else if (!isLast) {
      menu.children = [];
      addBackRecursively(menu.children, menu, parent, activate, exit, true);
    }
  });
}
