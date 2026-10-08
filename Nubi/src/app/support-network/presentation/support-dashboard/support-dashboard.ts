import { Component } from '@angular/core';

@Component({
  selector: 'app-support-dashboard',
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
    status: 'Calma',
    lastMessage: 'Tengo sed',
    lastMessageDescription: 'Diana quiere tomar agua.',
    lastUpdate: 'Hace 1 minuto',
  };

  // Recent activities displayed to the caregiver
  // as part of the user's follow-up information.
  protected readonly activities = [
    {
      activity: 'Uso de tablero',
      time: '10:32 AM',
    },
    {
      activity: 'Recurso de calma utilizado',
      time: '09:45 AM',
    },
    {
      activity: 'Descanso finalizado',
      time: '08:30 AM',
    },
  ];

  // Mock values used to represent the wellbeing level
  // during the last seven days.
  protected readonly wellbeing = [45, 30, 85, 42, 38, 40, 50];

  // Day labels used in the wellbeing chart.
  protected readonly chartDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
}
