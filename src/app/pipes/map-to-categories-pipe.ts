import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapToCategories',
  standalone: true, // ✅ Important since you’re using standalone components
})
export class MapToCategoriesPipe implements PipeTransform {
  transform(destinations: any[]): string[] {
    if (!destinations || destinations.length === 0) return [];
    const categories = destinations
      .map((d) => d.category)
      .filter((c) => !!c && c.trim() !== '');
    return Array.from(new Set(categories)).sort();
  }
}
