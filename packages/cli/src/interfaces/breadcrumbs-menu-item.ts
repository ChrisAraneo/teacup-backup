import { MenuItem } from './menu-item.js';

export interface BreadcrumbsMenuItem extends MenuItem {
  breadcrumbs: string[];
}
