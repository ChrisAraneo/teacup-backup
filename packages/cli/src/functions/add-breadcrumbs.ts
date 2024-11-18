import { MenuItem } from '../interfaces/menu-item.js';
import { isEmpty } from './is-empty.js';

export function addBreadcrumbs(menus: MenuItem[]): void {
  addBreadcrumbsRecursively(menus, []);
}

function addBreadcrumbsRecursively(
  menus: MenuItem[],
  parentPath: string[],
): void {
  menus.forEach((menu) => {
    if (isEmpty(menu.children)) {
      addBreadcrumbsRecursively(menu.children, [
        ...(parentPath || []),
        menu.name,
      ]);
    }

    menu.breadcrumbs = [...(parentPath || [])];
  });
}
