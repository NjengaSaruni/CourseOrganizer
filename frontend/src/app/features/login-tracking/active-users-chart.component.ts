import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import Chart.js using the default export to avoid ESM/CJS interop issues
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
// Using official Chart.js types via import above

interface TimeSeriesData {
  daily_active_users: Array<{
    date: string;
    active_users: number;
  }>;
  hourly_active_users: Array<{
    datetime: string;
    active_users: number;
  }>;
}

@Component({
  selector: 'app-active-users-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Active Users</h2>
          <p class="text-sm text-gray-600">User activity over time</p>
        </div>
        <div class="flex space-x-2">
          <button 
            [class.bg-emerald-50]="timeRange === 'daily'"
            [class.text-emerald-700]="timeRange === 'daily'"
            [class.bg-gray-50]="timeRange !== 'daily'"
            [class.text-gray-600]="timeRange !== 'daily'"
            (click)="switchTimeRange('daily')"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors">
            Daily
          </button>
          <button 
            [class.bg-emerald-50]="timeRange === 'hourly'"
            [class.text-emerald-700]="timeRange === 'hourly'"
            [class.bg-gray-50]="timeRange !== 'hourly'"
            [class.text-gray-600]="timeRange !== 'hourly'"
            (click)="switchTimeRange('hourly')"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors">
            Hourly
          </button>
        </div>
      </div>
      
      <div class="relative h-[400px]">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `
})
export class ActiveUsersChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @Input() timeSeriesData!: TimeSeriesData;
  
  private chart: any | null = null;
  timeRange: 'daily' | 'hourly' = 'daily';

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeSeriesData'] && !changes['timeSeriesData'].firstChange) {
      this.updateChart();
    }
  }

  switchTimeRange(range: 'daily' | 'hourly'): void {
    this.timeRange = range;
    this.updateChart();
  }

  private createChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const data = this.getChartData();

    this.chart = new (Chart as any)(ctx, {
      type: 'line',
      data: data,
      options: this.getChartOptions()
    });
  }

  private updateChart(): void {
    if (!this.chart) {
      this.createChart();
      return;
    }

    const data = this.getChartData();
    this.chart.data = data;
    this.chart.options = this.getChartOptions();
    this.chart.update();
  }

  private getChartData(): any {
    const points = (this.timeRange === 'daily'
      ? (this.timeSeriesData?.daily_active_users || []).map(d => {
          const dateStr = (d as { date: string }).date;
          const date = new Date(dateStr);
          console.log('Daily data point:', { dateStr, date, isValid: !isNaN(date.getTime()) });
          return {
            x: date,
            y: (d as { active_users: number }).active_users
          };
        })
      : (this.timeSeriesData?.hourly_active_users || []).map(d => {
          const datetimeStr = (d as { datetime: string }).datetime;
          const date = new Date(datetimeStr);
          console.log('Hourly data point:', { datetimeStr, date, isValid: !isNaN(date.getTime()) });
          return {
            x: date,
            y: (d as { active_users: number }).active_users
          };
        })
    ).sort((a, b) => +a.x - +b.x);

    console.log('Chart data points:', points);

    return {
      datasets: [{
        label: 'Active Users',
        data: points,
        parsing: false, // we already provide {x,y}
        borderColor: '#059669',
        backgroundColor: '#A7F3D0',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      }]
    } as any;
  }

  private getChartOptions(): any {
    const timeUnit = this.timeRange === 'daily' ? 'day' : 'hour';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'nearest',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#111827',
          bodyColor: '#111827',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          padding: 12,
          titleFont: { size: 14, weight: 600 },
          bodyFont: { size: 13 },
          callbacks: {
            title: (items: any[]) => {
              const ts: number = items[0]?.parsed?.x;
              if (!ts) return '';
              const date = new Date(ts);
              return this.timeRange === 'daily'
                ? date.toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })
                : date.toLocaleString(undefined, {
                    hour: '2-digit', minute: '2-digit', hour12: false,
                    year: 'numeric', month: 'short', day: 'numeric'
                  });
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: timeUnit,
            displayFormats: {
              day: 'MMM d',
              hour: 'MMM d HH:mm'
            },
            tooltipFormat: this.timeRange === 'daily' ? 'PPPP' : 'MMM d, HH:mm'
          },
          grid: { 
            display: true,
            color: '#F3F4F6'
          },
          ticks: { 
            maxRotation: 45, 
            autoSkip: true,
            maxTicksLimit: this.timeRange === 'daily' ? 7 : 12,
            color: '#6B7280',
            font: {
              size: 12
            }
          },
          title: {
            display: true,
            text: this.timeRange === 'daily' ? 'Date' : 'Date & Time',
            color: '#374151',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#F3F4F6' },
          ticks: { 
            precision: 0,
            color: '#6B7280',
            font: {
              size: 12
            }
          },
          title: {
            display: true,
            text: 'Active Users',
            color: '#374151',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        }
      },
      interaction: { intersect: false, mode: 'nearest' }
    } as any;
  }
}
