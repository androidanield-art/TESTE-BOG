import React from 'react';

export type CategoryType = 'growth' | 'branding' | 'tech' | 'strategy';

export interface ServiceItem {
  id: string;
  name: string;
  category: CategoryType;
  description: string;
}

export interface SelectedService extends ServiceItem {
  uniqueId: string;
  price?: string; // New field for budget values
}

export interface CategoryDefinition {
  id: CategoryType;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export interface PresentationSlide {
  id: string;
  title: string;
  subtitle?: string;
  content: string[];
  type: 'cover' | 'content' | 'closing' | 'service_list' | 'budget';
  servicesList?: SelectedService[];
}

export interface PresentationData {
  title: string;
  slides: PresentationSlide[];
}