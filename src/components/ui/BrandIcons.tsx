import { Home, Search, Waypoints, Users, Settings, Bell, CheckCircle2, PlayCircle, Instagram } from 'lucide-react';

export const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 256 256" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M170 32c10 22 27 37 54 41v38c-19-1-36-7-52-18v73c0 37-30 67-67 67s-67-30-67-67 30-67 67-67a67 67 0 0 1 12 1v40a27 27 0 1 0 15 24V32h38z"/>
  </svg>
);

export const BrandIcons = { 
  Home, 
  Search, 
  Waypoints, 
  Users, 
  Settings, 
  Bell, 
  CheckCircle2, 
  PlayCircle, 
  Instagram, 
  TikTokIcon 
};
