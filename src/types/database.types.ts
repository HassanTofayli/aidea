export type UserRole = 'admin' | 'user';
export type ItemStatus = 'active' | 'coming_soon' | 'archived';
export type RequestStatus = 'pending' | 'approved' | 'denied';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  url: string;
  category_id: string;
  status: ItemStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface UserAccess {
  user_id: string;
  item_id: string;
  granted_at: string;
  expires_at?: string;
}

export interface AccessRequest {
  id: string;
  user_id: string;
  item_id: string;
  status: RequestStatus;
  request_message?: string;
  admin_notes?: string;
  requested_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  item_id?: string;
  category_id?: string;
  last_seen_update: string;
  subscribed_at: string;
}

export interface ItemWithAccess extends Item {
  has_access: boolean;
  is_subscribed?: boolean;
}