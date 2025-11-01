/**
 * Shared User Model
 * Used by both web frontend and mobile app
 */

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  registration_number: string;
  phone_number: string;
  status: 'pending' | 'approved' | 'rejected';
  is_admin: boolean;
  can_upload_content?: boolean;
  user_type: 'student' | 'teacher' | 'admin';
  date_joined: string;
  date_joined_formatted?: string;
  last_login?: string;
  last_login_formatted: string;
  class_display_name?: string;
  profile_picture?: string;
  passcode?: string;
  smsSent?: boolean;
  class_rep_role?: {
    id: number;
    is_active: boolean;
    permissions: string[];
    student_class: number;
    student_class_name: string;
  };
}

export interface RegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  registration_number: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegistrationResponse {
  user_id: number;
  message: string;
  status: string;
  program: string;
  class: string;
  graduation_year: number;
}

