import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './admin-tabs.page.html',
  styleUrls: ['./admin-tabs.page.scss'],
})
export class AdminTabsPage {}