import { cloneDeep } from 'lodash';

import { isNotEmpty } from '../../functions/is-not-empty.js';
import { MenuItem } from '../../interfaces/menu-item.js';

export function addBreadcrumbs(menus: MenuItem[]): MenuItem[] {
  const menusClone = cloneDeep(menus);

  addBreadcrumbsRecursively(menusClone, []);

  return menusClone;
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
