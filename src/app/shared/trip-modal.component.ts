import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ModalController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TripService } from '../services/TripAndDestination/trip.service';
import { TripSignalService } from '../services/TripAndDestination/trip-signal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-trip-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './trip-modal.component.html',
})
export class TripModalComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() trip: any = {
    title: '',
    caption: '',
    startDate: '',
    endDate: '',
    rating: 0,
    imageUrls: [],
    draft: true,
    approved: false,
    destination: { id: null, name: '', category: '', rating: 0 },
  };

  preview: string | null = null;
  categories: string[] = [];
  private destApi = `${environment.apiBaseUrl}/destinations`;

  constructor(
    private modalCtrl: ModalController,
    private tripService: TripService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private tripSignal: TripSignalService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    if (this.trip?.imageUrls?.length) {
      this.preview = this.trip.imageUrls[0];
    }
    await this.loadCategories();
  }

  /** 🔹 Load categories */
  private async loadCategories() {
    try {
      const destinations = await this.http.get<any[]>(this.destApi).toPromise();
      const categorySet = new Set(
        (destinations || [])
          .map((d) => d.category?.trim().toLowerCase())
          .filter(Boolean)
      );
      this.categories = Array.from(categorySet).sort();
    } catch (err) {
      console.error('[TripModal] ❌ Failed to load categories:', err);
      this.showToast('Failed to load categories', 'warning');
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  /** 🖼 Image preview */
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      await this.showToast('Image too large. Please select under 2MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
      this.trip.imageUrls = [this.preview];
    };
    reader.readAsDataURL(file);
  }

  /** ✅ Save trip as draft */
  async saveDraft() {
    await this.saveTrip('draft');
  }

  /** 📤 Send trip for approval */
  async sendForApproval() {
    const confirm = await this.alertCtrl.create({
      header: 'Send for Approval',
      message: 'Are you sure you want to send this trip for admin approval?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Yes',
          handler: async () => {
            await this.saveTrip('pending');
          },
        },
      ],
    });
    await confirm.present();
  }

  /** 🧠 Core save logic */
  private async saveTrip(mode: 'draft' | 'pending') {
    const tripCopy = JSON.parse(JSON.stringify(this.trip));
    tripCopy.draft = mode === 'draft';
    tripCopy.approved = false;

    if (!tripCopy.title?.trim() || !tripCopy.destination?.name?.trim()) {
      await this.showToast('Please fill title and destination.', 'warning');
      return;
    }

    try {
      let savedTrip;
      if (this.mode === 'create') {
        savedTrip = await this.tripService.createTrip(tripCopy).toPromise();
        this.tripSignal.addTrip(savedTrip);
      } else {
        savedTrip = await this.tripService.updateTrip(tripCopy.id, tripCopy).toPromise();
        this.tripSignal.updateTrip(savedTrip);
      }

      await this.showToast(
        mode === 'draft'
          ? 'Trip saved as draft.'
          : 'Trip sent for approval!',
        mode === 'draft' ? 'medium' : 'success'
      );
      this.modalCtrl.dismiss(true);
    } catch (err) {
      console.error('[TripModal] ❌ Save failed:', err);
      await this.showToast('Failed to save trip. Try again.', 'danger');
    }
  }

  private async showToast(msg: string, color: string = 'medium') {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1500, color });
    toast.present();
  }
}
