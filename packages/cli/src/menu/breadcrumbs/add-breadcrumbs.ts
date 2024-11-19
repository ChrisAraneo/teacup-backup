import { cloneDeep } from '../../functions/clone-deep.js';
import { isNotEmpty } from '../../functions/is-not-empty.js';
import { MenuItem } from '../../interfaces/menu-item.js';

export function addBreadcrumbs(items: MenuItem[]): MenuItem[] {
  const clone = cloneDeep(items);

  addBreadcrumbsRecursively(clone, []);

  return clone;
}

function addBreadcrumbsRecursively(
  menus: MenuItem[],
  parentPath: string[],
): void {
  menus.forEach((menu) => {
    if (isNotEmpty(menu.children)) {
      addBreadcrumbsRecursively(menu.children, [
        ...(parentPath || []),
        menu.name,
      ]);
    }

    menu.breadcrumbs = [...(parentPath || [])];
  });
}
