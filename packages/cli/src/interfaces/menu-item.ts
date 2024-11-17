export interface MenuItem {
  name: string;
  children?: MenuItem[];
  breadcrumbs?: string[];
  onSelect?: () => void;
}
