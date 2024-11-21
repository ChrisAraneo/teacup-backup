import { cloneDeep } from '../../functions/clone-deep.js';
import { isNotEmpty } from '../../functions/is-not-empty.js';
import { BreadcrumbsMenuItem } from '../../interfaces/breadcrumbs-menu-item.js';
import { MenuItem } from '../../interfaces/menu-item.js';

export function addBreadcrumbs(items: MenuItem[]): BreadcrumbsMenuItem[] {
  const clone = cloneDeep(items);

  addBreadcrumbsRecursively(clone, []);

  return clone as BreadcrumbsMenuItem[];
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

    (menu as BreadcrumbsMenuItem).breadcrumbs = [...(parentPath || [])];
  });
}
