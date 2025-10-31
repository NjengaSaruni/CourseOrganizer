/**
 * Utility for parsing chat messages and extracting references
 * - @mentions: @[userId:UserName]
 * - [[materials]]: [[materialId:MaterialTitle]]
 * - #topics: #topicname
 */

export interface MentionReference {
  type: 'mention';
  userId: number | string;
  userName: string;
  start: number;
  end: number;
  text: string;
}

export interface MaterialReference {
  type: 'material';
  materialId: number | string;
  materialTitle: string;
  start: number;
  end: number;
  text: string;
}

export interface TopicReference {
  type: 'topic';
  topic: string;
  start: number;
  end: number;
  text: string;
}

export type MessageReference = MentionReference | MaterialReference | TopicReference;

export interface ParsedMessage {
  plainText: string;
  references: MessageReference[];
}

/**
 * Parse a message and extract all references
 */
export function parseMessage(message: string): ParsedMessage {
  const references: MessageReference[] = [];

  // Parse @mentions: @[userId:UserName]
  const mentionRegex = /@\[(\d+):([^\]]+)\]/g;
  let match;
  while ((match = mentionRegex.exec(message)) !== null) {
    references.push({
      type: 'mention',
      userId: parseInt(match[1]),
      userName: match[2],
      start: match.index,
      end: match.index + match[0].length,
      text: match[0]
    });
  }

  // Parse [[materials]]: [[materialId:MaterialTitle]]
  const materialRegex = /\[\[(\d+):([^\]]+)\]\]/g;
  while ((match = materialRegex.exec(message)) !== null) {
    references.push({
      type: 'material',
      materialId: parseInt(match[1]),
      materialTitle: match[2],
      start: match.index,
      end: match.index + match[0].length,
      text: match[0]
    });
  }

  // Parse #topics: #topicname (alphanumeric and underscores)
  const topicRegex = /#(\w+)/g;
  while ((match = topicRegex.exec(message)) !== null) {
    references.push({
      type: 'topic',
      topic: match[1],
      start: match.index,
      end: match.index + match[0].length,
      text: match[0]
    });
  }

  // Sort references by start position
  references.sort((a, b) => a.start - b.start);

  return {
    plainText: message,
    references
  };
}

/**
 * Convert a message with references into HTML with clickable elements
 */
export function renderMessageWithReferences(message: string): string {
  const parsed = parseMessage(message);
  
  if (parsed.references.length === 0) {
    return escapeHtml(message);
  }

  let html = '';
  let lastIndex = 0;

  for (const ref of parsed.references) {
    // Add text before this reference
    html += escapeHtml(message.substring(lastIndex, ref.start));

    // Add the reference as styled HTML
    if (ref.type === 'mention') {
      html += `<span class="chat-mention" data-user-id="${ref.userId}" title="${ref.userName}">@${escapeHtml(ref.userName)}</span>`;
    } else if (ref.type === 'material') {
      html += `<span class="chat-material" data-material-id="${ref.materialId}" title="${ref.materialTitle}">[[${escapeHtml(ref.materialTitle)}]]</span>`;
    } else if (ref.type === 'topic') {
      html += `<span class="chat-topic" data-topic="${ref.topic}">#${escapeHtml(ref.topic)}</span>`;
    }

    lastIndex = ref.end;
  }

  // Add remaining text
  html += escapeHtml(message.substring(lastIndex));

  return html;
}

/**
 * Extract the current word being typed and its type
 */
export function getActiveReference(text: string, cursorPosition: number): { 
  type: 'user' | 'material' | 'topic' | null; 
  query: string;
  start: number;
  end: number;
} | null {
  // Find the word at cursor position
  const beforeCursor = text.substring(0, cursorPosition);
  
  // Check for @mention (allow any characters except whitespace)
  const mentionMatch = beforeCursor.match(/@([^\s]*)$/);
  if (mentionMatch) {
    console.log('✅ Found @mention:', { query: mentionMatch[1], full: mentionMatch[0] });
    return {
      type: 'user',
      query: mentionMatch[1],
      start: beforeCursor.length - mentionMatch[0].length,
      end: cursorPosition
    };
  }

  // Check for [[material (allow any characters except closing bracket)
  const materialMatch = beforeCursor.match(/\[\[([^\]]*)$/);
  if (materialMatch) {
    console.log('✅ Found [[material:', { query: materialMatch[1], full: materialMatch[0] });
    return {
      type: 'material',
      query: materialMatch[1],
      start: beforeCursor.length - materialMatch[0].length,
      end: cursorPosition
    };
  }

  // Check for #topic (alphanumeric and underscores only)
  const topicMatch = beforeCursor.match(/#(\w*)$/);
  if (topicMatch) {
    console.log('✅ Found #topic:', { query: topicMatch[1], full: topicMatch[0] });
    return {
      type: 'topic',
      query: topicMatch[1],
      start: beforeCursor.length - topicMatch[0].length,
      end: cursorPosition
    };
  }

  return null;
}

/**
 * Replace text at a specific position with a reference
 */
export function insertReference(
  text: string,
  start: number,
  end: number,
  reference: { type: 'user'; userId: number | string; userName: string } | 
             { type: 'material'; materialId: number | string; materialTitle: string } | 
             { type: 'topic'; topic: string }
): string {
  let replacement = '';
  
  if (reference.type === 'user') {
    replacement = `@[${reference.userId}:${reference.userName}]`;
  } else if (reference.type === 'material') {
    replacement = `[[${reference.materialId}:${reference.materialTitle}]]`;
  } else if (reference.type === 'topic') {
    replacement = `#${reference.topic}`;
  }

  return text.substring(0, start) + replacement + ' ' + text.substring(end);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get all mentions from a message
 */
export function extractMentions(message: string): Array<{ userId: number; userName: string }> {
  const mentions: Array<{ userId: number; userName: string }> = [];
  const mentionRegex = /@\[(\d+):([^\]]+)\]/g;
  let match;
  
  while ((match = mentionRegex.exec(message)) !== null) {
    mentions.push({
      userId: parseInt(match[1]),
      userName: match[2]
    });
  }
  
  return mentions;
}

/**
 * Get all material references from a message
 */
export function extractMaterials(message: string): Array<{ materialId: number; materialTitle: string }> {
  const materials: Array<{ materialId: number; materialTitle: string }> = [];
  const materialRegex = /\[\[(\d+):([^\]]+)\]\]/g;
  let match;
  
  while ((match = materialRegex.exec(message)) !== null) {
    materials.push({
      materialId: parseInt(match[1]),
      materialTitle: match[2]
    });
  }
  
  return materials;
}

/**
 * Get all topics from a message
 */
export function extractTopics(message: string): string[] {
  const topics: string[] = [];
  const topicRegex = /#(\w+)/g;
  let match;
  
  while ((match = topicRegex.exec(message)) !== null) {
    topics.push(match[1]);
  }
  
  return topics;
}

