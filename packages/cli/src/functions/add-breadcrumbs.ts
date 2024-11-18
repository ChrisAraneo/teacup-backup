import { MenuItem } from '../interfaces/menu-item.js';
import { isNotEmpty } from './is-not-empty.js';

export function addBreadcrumbs(menus: MenuItem[]): void {
  addBreadcrumbsRecursively(menus, []);
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
