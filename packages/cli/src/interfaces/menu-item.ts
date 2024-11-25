export interface MenuItem {
  name: string;
  description?: string;
  children?: MenuItem[];
  onSelect?: () => void;
}
