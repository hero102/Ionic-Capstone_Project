import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './tabs.page.html',
})
export class TabsPage {}
