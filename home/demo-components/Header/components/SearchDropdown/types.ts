export type SearchResultType = 'component' | 'demo' | 'doc';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url?: string;
}

export interface SearchDropdownProps {
  visible: boolean;
  searchValue: string;
  onClose: () => void;
}
