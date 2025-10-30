# Learning Hub Duplication Fix

## Issue
After uploading course content, items appeared duplicated in the Learning Hub, with one item having no proper title.

## Root Cause
The `get_course_timeline` backend endpoint already returns ALL content types (outlines, past papers, materials, assignments, recordings) in a special "Course Materials" section. However, the frontend was:
1. Calling `getCourseTimeline()` - which includes all content
2. Then separately calling individual endpoints like `getCourseOutlines()`, `getPastPapers()`, etc.
3. This caused the same content to be loaded twice, appearing as duplicates

## Solution

### 1. Updated Content Loading Logic
Modified `loadCourseMaterials()` to properly parse the timeline response structure:

```typescript
private loadCourseMaterials(): void {
  // Timeline endpoint includes ALL content types
  this.contentService.getCourseTimeline(this.selectedCourseId).subscribe({
    next: (response) => {
      const items: ContentItem[] = [];
      
      response.timeline.forEach(lesson => {
        lesson.content.forEach((contentItem: any) => {
          // Backend returns: { type: 'course_outline', data: {...} }
          // OR direct objects for old timeline items
          const content = contentItem.data || contentItem;
          const contentType = contentItem.type || content.content_type;
          
          // Map types correctly
          let mappedType = 'material';
          if (contentType === 'course_outline') mappedType = 'outline';
          else if (contentType === 'past_paper') mappedType = 'past_paper';
          // ... etc
          
          items.push({ /* properly mapped content */ });
        });
      });
      
      // Finalize immediately - no need for additional API calls
      this.finalizeContent(items);
    }
  });
}
```

### 2. Removed Redundant API Calls
Deleted these methods that were causing duplication:
- `loadAdditionalMaterials()`
- `loadPastPapers()`
- `loadAssignments()`
- `loadSupplementaryMaterials()`
- `loadRecordings()`

Now only ONE API call is made to `getCourseTimeline`, which returns everything.

### 3. Enhanced Deduplication Logic
Added robust deduplication in `finalizeContent()`:
- Deduplicates by both ID and file URL
- Prefers items with specific titles over generic ones
- Handles edge cases where content might still appear twice

## Backend Context
The timeline endpoint structure (from `course_api/views.py`):
```python
# Lines 1703-1757
for outline in course_outlines:
    general_content.append({
        'type': 'course_outline',
        'data': CourseOutlineSerializer(outline).data
    })
    
# Same for past_papers, materials, assignments, etc.
```

## Result
- ✅ No more duplicate content items
- ✅ Proper titles displayed for all content
- ✅ Reduced API calls (better performance)
- ✅ Cleaner, more maintainable code

## Files Modified
- `/Users/ptah/course-organizer/frontend/src/app/features/learning-hub/learning-hub.component.ts`
  - Updated `loadCourseMaterials()` to properly parse timeline response
  - Removed 5 redundant loading methods
  - Enhanced `finalizeContent()` deduplication logic

