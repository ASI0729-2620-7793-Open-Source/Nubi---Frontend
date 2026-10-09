import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-support-dashboard',
  imports: [TranslatePipe],
  templateUrl: './support-dashboard.html',
  styleUrl: './support-dashboard.css',
})
export class SupportDashboard {
  // Basic caregiver information displayed in the dashboard header.
  protected readonly caregiver = {
    name: 'María',
  };

  // Mock user data used to represent the current state
  // and the latest communication in the dashboard.
  protected readonly user = {
    name: 'Diana',
    statusKey: 'supportNetwork.mock.statusCalm',
    lastMessageKey: 'supportNetwork.mock.thirsty',
    lastMessageDescriptionKey: 'supportNetwork.mock.thirstyDescription',
    lastUpdateKey: 'supportNetwork.mock.oneMinuteAgo',
  };

  // Recent activities displayed to the caregiver
  // as part of the user's follow-up information.
  protected readonly activities = [
    {
      activityKey: 'supportNetwork.mock.boardUse',
      time: '10:32 AM',
    },
    {
      activityKey: 'supportNetwork.mock.calmResourceUsed',
      time: '09:45 AM',
    },
    {
      activityKey: 'supportNetwork.mock.breakFinished',
      time: '08:30 AM',
    },
  ];

  // Mock values used to represent the wellbeing level
  // during the last seven days.
  protected readonly wellbeing = [45, 30, 85, 42, 38, 40, 50];

  // Translation keys of the day labels used in the wellbeing chart.
  protected readonly chartDayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(
    (day) => `supportNetwork.days.${day}`,
  );
}
