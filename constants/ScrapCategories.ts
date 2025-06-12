import { ScrapCategory } from '../types';

export const SCRAP_CATEGORIES: { 
  key: ScrapCategory; 
  label: string; 
  icon: string; 
  color: string;
}[] = [
  {
    key: 'metal',
    label: 'Metal Scraps',
    icon: '🔩',
    color: '#6b7280'
  },
  {
    key: 'electronics',
    label: 'Electronics',
    icon: '📱',
    color: '#3b82f6'
  },
  {
    key: 'plastic',
    label: 'Plastics',
    icon: '🥤',
    color: '#10b981'
  },
  {
    key: 'paper',
    label: 'Paper & Cardboard',
    icon: '📄',
    color: '#f59e0b'
  },
  {
    key: 'glass',
    label: 'Glass',
    icon: '🍾',
    color: '#06b6d4'
  },
  {
    key: 'automotive',
    label: 'Auto Parts',
    icon: '🚗',
    color: '#ef4444'
  },
  {
    key: 'textile',
    label: 'Textiles',
    icon: '👕',
    color: '#8b5cf6'
  },
  {
    key: 'rubber',
    label: 'Rubber',
    icon: '🛞',
    color: '#1f2937'
  }
];

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];