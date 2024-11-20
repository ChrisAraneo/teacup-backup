import { MenuItem } from '../interfaces/menu-item.js';

export function findMenuItem(
  items: MenuItem[],
  searched: MenuItem,
): MenuItem | undefined {
  let found: MenuItem | undefined;

  const f = (items: MenuItem[]) => {
    items.forEach((item) => {
      if (!found && isMenuItemEqual(item, searched)) {
        found = item;
        return;
      } else {
        f(item?.children || []);
      }
    });
  };

  f(items);

  return found;
}

// Quick way to compare menu items, it's not perfect but good enough for now
function isMenuItemEqual(a: MenuItem, b: MenuItem): boolean {
  const toString: (i: MenuItem) => string = (i: MenuItem) => {
    if (!i?.children) {
      return i.name + '||';
    } else {
      return i.name + '|' + i.children.map((c) => toString(c)).join('');
    }
  };

  return toString(a) === toString(b);
}
