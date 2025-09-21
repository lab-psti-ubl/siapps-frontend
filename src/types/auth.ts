export interface User {
  id: string;
  name: string;
  phone: string;
  qrCode: string;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  userType: 'admin' | 'user' | null;
  currentUser: User | null;
}