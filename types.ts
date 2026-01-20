
import React from 'react';

export type Language = 'ar' | 'en';

export enum CategoryType {
  ALPHABET = 'ALPHABET',
  NUMBERS = 'NUMBERS',
  SHAPES = 'SHAPES',
  IMAGES = 'IMAGES'
}

export interface GameItem {
  id: string;
  label: string;
  image: string; // The character, number, or emoji
  soundText: string;
}

export interface LearningItem extends GameItem {
  color?: string;
  subLabel?: string;
}

export interface Category {
  type: CategoryType;
  titleEn: string;
  titleAr: string;
  icon: string | React.ReactNode;
  color: string;
}
