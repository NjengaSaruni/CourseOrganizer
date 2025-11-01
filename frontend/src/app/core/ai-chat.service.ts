import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatConversation {
  id: number;
  user: number;
  course: number | null;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ChatMessage {
  id: number;
  conversation: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
}

export interface Concept {
  id: number;
  name: string;
  description: string;
  keywords: string[];
  parent_concept: number | null;
  created_at: string;
  updated_at: string;
}

export interface ConceptMastery {
  id: number;
  user: number;
  concept: Concept;
  course: number | null;
  mastery_level: 'not_started' | 'introduced' | 'developing' | 'proficient' | 'mastered';
  mastery_score: number;
  last_assessed_at: string | null;
  assessment_count: number;
}

export interface CourseMasteryPercentage {
  user_id: number;
  course_id: number;
  mastery_percentage: number;
  total_concepts: number;
  assessed_concepts: number;
}

export interface ChatResponse {
  message: ChatMessage;
  response?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Conversations
  listConversations(courseId?: number): Observable<ChatConversation[]> {
    let url = `${this.baseUrl}/ai-chat/conversations/`;
    if (courseId) {
      url += `?course=${courseId}`;
    }
    return this.http.get<ChatConversation[]>(url);
  }

  getConversation(id: number): Observable<ChatConversation> {
    return this.http.get<ChatConversation>(`${this.baseUrl}/ai-chat/conversations/${id}/`);
  }

  createConversation(courseId?: number, title?: string): Observable<ChatConversation> {
    return this.http.post<ChatConversation>(`${this.baseUrl}/ai-chat/conversations/`, {
      course: courseId || null,
      title: title || ''
    });
  }

  deleteConversation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/ai-chat/conversations/${id}/`);
  }

  // Messages
  getMessages(conversationId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/ai-chat/conversations/${conversationId}/messages/`);
  }

  sendMessage(conversationId: number, content: string, role: 'user' | 'assistant' | 'system' = 'user', metadata?: any): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/ai-chat/conversations/${conversationId}/messages/`, {
      conversation: conversationId,
      role,
      content,
      metadata: metadata || {}
    });
  }

  // Chat with AI (sends message and gets AI response)
  chatWithAI(conversationId: number, message: string, courseId?: number): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl}/ai-chat/conversations/${conversationId}/chat/`, {
      message,
      course_id: courseId
    });
  }

  // Concepts
  listConcepts(courseId?: number): Observable<Concept[]> {
    const params = courseId ? `?course_id=${courseId}` : '';
    return this.http.get<Concept[]>(`${this.baseUrl}/ai-chat/concepts${params}`);
  }

  getConcept(id: number): Observable<Concept> {
    return this.http.get<Concept>(`${this.baseUrl}/ai-chat/concepts/${id}/`);
  }

  // Mastery
  listMastery(courseId?: number): Observable<ConceptMastery[]> {
    const params = courseId ? `?course_id=${courseId}` : '';
    return this.http.get<ConceptMastery[]>(`${this.baseUrl}/ai-chat/mastery/${params}`);
  }

  updateMastery(mastery: Partial<ConceptMastery>): Observable<ConceptMastery> {
    return this.http.post<ConceptMastery>(`${this.baseUrl}/ai-chat/mastery/`, mastery);
  }

  calculateCourseMastery(userId: number, courseId: number): Observable<CourseMasteryPercentage> {
    return this.http.post<CourseMasteryPercentage>(
      `${this.baseUrl}/ai-chat/mastery/calculate_course_mastery/`,
      { user_id: userId, course_id: courseId }
    );
  }
}

