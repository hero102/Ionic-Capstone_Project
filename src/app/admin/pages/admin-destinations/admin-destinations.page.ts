import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { DestinationService } from 'src/app/services/TripAndDestination/destination.service';

@Component({
  selector: 'app-admin-destinations',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './admin-destinations.page.html',
  styleUrls: ['./admin-destinations.page.scss'],
})
export class AdminDestinationsPage implements OnInit {
  // 🧠 Reactive state
  categories = signal<{ id: number; category: string }[]>([]);
  search = signal('');
  loading = signal(false);

  // 🔍 Computed for filtered categories
  filteredCategories = computed(() => {
    const term = this.search().toLowerCase();
    return this.categories().filter((c) =>
      c.category.toLowerCase().includes(term)
    );
  });

  constructor(
    private destService: DestinationService,
    private toastCtrl: ToastController,
    private loaderCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  /** 🔁 Load all unique categories */
  async loadCategories() {
    this.loading.set(true);
    const loader = await this.loaderCtrl.create({
      message: 'Loading categories...',
      spinner: 'crescent',
    });
    await loader.present();

    try {
      // ✅ Load unique category list from backend
      const data = (await this.destService.listUniqueCategories().toPromise()) || [];

      // Map with artificial IDs for rendering
      const mapped = data.map((cat: string, index: number) => ({
        id: index + 1,
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
      }));

      this.categories.set(mapped);
    } catch (e) {
      console.error('[AdminDestinations] ❌ Failed to load:', e);
      const toast = await this.toastCtrl.create({
        message: 'Failed to fetch categories',
        duration: 1500,
        color: 'warning',
      });
      await toast.present();
    } finally {
      this.loading.set(false);
      await loader.dismiss();
    }
  }

  /** 🔍 Search handler */
  onSearchChange(event: any) {
    this.search.set(event.target.value?.trim().toLowerCase() || '');
  }

  /** ➕ Add new category */
  async addCategory() {
    const alert = await this.alertCtrl.create({
      header: 'Add Category',
      inputs: [{ name: 'category', placeholder: 'Enter category name (e.g., Beach)' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (val) => {
            const name = val.category?.trim();
            if (!name) return false;

            const loader = await this.loaderCtrl.create({ message: 'Saving...' });
            await loader.present();

            try {
              await this.destService.create({ category: name }).toPromise();
              await this.loadCategories();
              const toast = await this.toastCtrl.create({
                message: 'Category added successfully',
                duration: 1000,
                color: 'success',
              });
              await toast.present();
            } catch (e) {
              console.error('[AddCategory] ❌', e);
              const toast = await this.toastCtrl.create({
                message: 'Failed to add category',
                duration: 1200,
                color: 'danger',
              });
              await toast.present();
            } finally {
              await loader.dismiss();
            }
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  /** ✏️ Edit existing category */
  async editCategory(cat: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Category',
      inputs: [{ name: 'category', value: cat.category, placeholder: 'Edit category' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: async (val) => {
            const name = val.category?.trim();
            if (!name) return false;

            const loader = await this.loaderCtrl.create({ message: 'Updating...' });
            await loader.present();

            try {
              await this.destService.update(cat.id, { category: name }).toPromise();
              await this.loadCategories();
              const toast = await this.toastCtrl.create({
                message: 'Category updated successfully',
                duration: 1000,
                color: 'success',
              });
              await toast.present();
            } catch (e) {
              console.error('[EditCategory] ❌', e);
              const toast = await this.toastCtrl.create({
                message: 'Failed to update category',
                duration: 1200,
                color: 'danger',
              });
              await toast.present();
            } finally {
              await loader.dismiss();
            }
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  /** 🗑 Delete category safely */
  async deleteCategory(cat: any) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Category',
      message: `Are you sure you want to delete "${cat.category}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const loader = await this.loaderCtrl.create({ message: 'Deleting...' });
            await loader.present();

            try {
              await this.destService.delete(cat.id).toPromise();
              await this.loadCategories();
              const toast = await this.toastCtrl.create({
                message: 'Category deleted successfully',
                duration: 1000,
                color: 'success',
              });
              await toast.present();
            } catch (e: any) {
              console.error('[DeleteCategory] ❌', e);
              let msg = 'Delete failed';
              if (e.status === 409) {
                msg =
                  e.error ||
                  'Cannot delete this category because one or more trips are linked to it.';
              } else if (e.status === 404) {
                msg = 'Category not found';
              }
              const toast = await this.toastCtrl.create({
                message: msg,
                duration: 1800,
                color: 'warning',
              });
              await toast.present();
            } finally {
              await loader.dismiss();
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
