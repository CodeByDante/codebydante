export interface ContentBlock {
  id: string;
  type: 'text' | 'markdown';
  content: any;
}

export interface DataItem {
  id: string;
  icon?: string;
  cardStyle?: 'bordered' | 'transparent' | 'filled'; // New field for card styling
  title: string;
  summary: string;
  content: string; // Kept for backward compatibility and search
  blocks?: ContentBlock[]; // New structure for multiple blocks
  downloadUrl?: string;
  visitUrl?: string;
  createdAt: number;
  tags: string[];
}

export type ViewState = 'LIST' | 'DETAIL' | 'CREATE' | 'EDIT';

export interface AlertMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}