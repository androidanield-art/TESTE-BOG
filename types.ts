import React from 'react';

export type CategoryType = 'growth' | 'branding' | 'tech' | 'strategy';

export interface ServiceItem {
  id: string;
  name: string;
  category: CategoryType;
  description: string;
}

export interface SelectedService extends ServiceItem {
  uniqueId: string; // To handle multiple instances if necessary, and for DnD keys
}

export interface CategoryDefinition {
  id: CategoryType;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export interface PresentationSlide {
  id: string; // Added for React keys when editing
  title: string;
  subtitle?: string;
  content: string[]; // Bullet points
  type: 'cover' | 'content' | 'closing' | 'service_list';
  servicesList?: SelectedService[]; // Optional payload for the specific service slide
}

export interface PresentationData {
  title: string;
  slides: PresentationSlide[];
}