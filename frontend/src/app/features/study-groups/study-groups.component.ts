import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupworkService, StudyGroup } from '../../core/groupwork.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-study-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  template: `
    <app-page-layout title="Study Groups">
      <div class="flex items-center gap-2 mb-4">
        <input [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="Search groups" class="border rounded px-3 py-2 w-full max-w-sm" />
        <button (click)="refresh()" class="px-3 py-2 rounded bg-black text-white">Search</button>
      </div>

      <div class="mb-6 p-4 border rounded">
        <h3 class="font-semibold mb-2">Create a group</h3>
        <div class="flex flex-wrap gap-2">
          <input [ngModel]="newName()" (ngModelChange)="newName.set($event)" placeholder="Group name" class="border rounded px-3 py-2" />
          <input [ngModel]="newDesc()" (ngModelChange)="newDesc.set($event)" placeholder="Description (optional)" class="border rounded px-3 py-2 w-64" />
          <select [ngModel]="selectedCourseId()" (ngModelChange)="selectedCourseId.set($event)" class="border rounded px-3 py-2">
            <option [ngValue]="null">No course</option>
            <option *ngFor="let c of myCourses()" [ngValue]="c.id">{{ c.code }} - {{ c.name }}</option>
          </select>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" [ngModel]="isPrivate()" (ngModelChange)="isPrivate.set($event)" /> Private
          </label>
          <button (click)="create()" class="px-3 py-2 rounded bg-black text-white">Create</button>
        </div>
      </div>

      <div class="grid gap-3">
        <div *ngFor="let g of groups()" class="border rounded p-4 flex items-center justify-between">
          <div>
            <div class="font-semibold">{{ g.name }}</div>
            <div class="text-sm text-gray-600">{{ g.description }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ g.members_count }} members • {{ g.is_private ? 'Private' : 'Open' }}<span *ngIf="g.course_name"> • {{ g.course_name }}</span></div>
          </div>
          <div class="flex gap-2">
            <button (click)="join(g)" class="px-3 py-2 rounded border">Join</button>
          </div>
        </div>
      </div>
    </app-page-layout>
  `
})
export class StudyGroupsComponent {
  private api = inject(GroupworkService);

  groups = signal<StudyGroup[]>([]);
  query = signal('');
  newName = signal('');
  newDesc = signal('');
  isPrivate = signal(false);
  myCourses = signal<any[]>([]);
  selectedCourseId = signal<number | null>(null);

  ngOnInit() {
    this.refresh();
    this.api.listMyCourses().subscribe(data => this.myCourses.set(data.courses || []));
  }

  refresh() {
    this.api.listGroups(this.query()).subscribe(gs => this.groups.set(gs));
  }

  create() {
    const name = this.newName().trim();
    if (!name) return;
    const payload: any = { name, description: this.newDesc().trim() || undefined, is_private: this.isPrivate() || undefined };
    if (this.selectedCourseId()) payload.course = this.selectedCourseId();
    this.api.createGroup(payload)
      .subscribe(() => {
        this.newName.set('');
        this.newDesc.set('');
        this.isPrivate.set(false);
        this.selectedCourseId.set(null);
        this.refresh();
      });
  }

  join(g: StudyGroup) {
    this.api.requestJoin(g.id).subscribe(() => this.refresh());
  }
}


