import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StudyGroup {
  id: number;
  name: string;
  description: string;
  course?: number | null;
  course_name?: string;
  is_private: boolean;
  max_members: number;
  created_at: string;
  updated_at: string;
  members_count: number;
  pending_requests: number;
}

export interface StudyGroupMembership {
  id: number;
  group: number;
  user: number;
  role: 'member' | 'admin';
  joined_at: string;
  user_name: string;
}

export interface GroupMeeting {
  id: number;
  group: number;
  title: string;
  description: string;
  meeting_id: string | null;
  platform: 'jitsi' | 'daily' | 'physical';
  scheduled_time: string;
  duration?: string | null;
  meeting_url?: string;
  location?: string;
  room_password?: string;
  created_at: string;
  created_by: number;
  video_join_url?: string;
}

@Injectable({ providedIn: 'root' })
export class GroupworkService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private unwrap<T>() {
    return map((resp: any) => (resp && Array.isArray(resp.results) ? (resp.results as T) : (resp as T)));
  }

  listGroups(query?: string): Observable<StudyGroup[]> {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.http.get<any>(`${this.baseUrl}/study-groups/${q}`).pipe(this.unwrap<StudyGroup[]>());
  }

  myGroups(): Observable<StudyGroup[]> {
    return this.http.get<any>(`${this.baseUrl}/study-groups/mine/`).pipe(this.unwrap<StudyGroup[]>());
  }

  createGroup(payload: { name: string; description?: string; is_private?: boolean }): Observable<StudyGroup> {
    return this.http.post<StudyGroup>(`${this.baseUrl}/study-groups/`, payload);
  }

  requestJoin(groupId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/study-groups/${groupId}/join/`, {});
  }

  leaveGroup(groupId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/study-groups/${groupId}/leave/`, {});
  }

  members(groupId: number): Observable<StudyGroupMembership[]> {
    return this.http.get<any>(`${this.baseUrl}/study-groups/${groupId}/members/`).pipe(this.unwrap<StudyGroupMembership[]>());
  }

  meetings(groupId: number): Observable<GroupMeeting[]> {
    return this.http.get<any>(`${this.baseUrl}/study-groups/${groupId}/meetings/`).pipe(this.unwrap<GroupMeeting[]>());
  }

  // Messages persistence
  listMessages(groupId: number, limit = 50) {
    return this.http.get<Array<{ id: number; group: number; sender: number; sender_name: string; sender_profile_picture?: string | null; body: string; created_at: string; reply_to?: { id: number; sender_name: string; sender_profile_picture?: string | null; body: string; created_at: string } }>>(
      `${this.baseUrl}/study-groups/${groupId}/messages/?limit=${limit}`
    );
  }

  createMessage(groupId: number, body: string) {
    return this.http.post<{ status: 'ok' }>(`${this.baseUrl}/study-groups/${groupId}/messages/`, { body });
  }

  deleteMessage(groupId: number, messageId: number) {
    return this.http.delete<{ status: 'deleted' }>(`${this.baseUrl}/study-groups/${groupId}/messages/${messageId}/`);
  }

  createMeeting(groupId: number, payload: { title: string; description?: string; scheduled_time?: string; platform?: 'jitsi' | 'daily' | 'physical'; room_password?: string; location?: string; }): Observable<GroupMeeting> {
    return this.http.post<GroupMeeting>(`${this.baseUrl}/study-groups/${groupId}/meetings/create/`, payload);
  }

  approveJoinRequest(groupId: number, requestId: number) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/study-groups/${groupId}/join-requests/${requestId}/approve/`, {});
  }

  denyJoinRequest(groupId: number, requestId: number) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/study-groups/${groupId}/join-requests/${requestId}/deny/`, {});
  }

  addMember(groupId: number, userId: number) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/study-groups/${groupId}/members/add/`, { user_id: userId });
  }

  removeMember(groupId: number, userId: number) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/study-groups/${groupId}/members/remove/`, { user_id: userId });
  }

  listMyCourses() {
    return this.http.get<{ courses: any[] }>(`${this.baseUrl}/courses/my-courses/`);
  }
}
