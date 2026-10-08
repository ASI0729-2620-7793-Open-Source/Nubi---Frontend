import { Component } from '@angular/core';

@Component({
  selector: 'app-support-dashboard',
  templateUrl: './support-dashboard.html',
  styleUrl: './support-dashboard.css',
})
export class SupportDashboard {
  protected readonly caregiver = {
    name: 'María',
  };

  protected readonly user = {
    name: 'Diana',
    status: 'Calma',
    lastMessage: 'Tengo sed',
    lastMessageDescription: 'Diana quiere tomar agua.',
    lastUpdate: 'Hace 1 minuto',
  };

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

  protected readonly wellbeing = [45, 30, 85, 42, 38, 40, 50];
  protected readonly chartDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
}
