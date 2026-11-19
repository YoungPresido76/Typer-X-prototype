import type { ReactElement } from 'react';
import type { ScreenId } from '../types/game';
import { BottomNav, type NavItem } from './BottomNav';

export type MainNavTab = 'home' | 'progress' | 'shop' | 'more';

interface MainNavProps {
  active: MainNavTab;
  navigate: (screen: ScreenId) => void;
  openMore: () => void;
}

export function MainNav({ active, navigate, openMore }: MainNavProps): ReactElement {
  const items: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'home', active: active === 'home', onSelect: () => navigate('command') },
    { id: 'progress', label: 'Progress', icon: 'star', active: active === 'progress', onSelect: () => navigate('progression') },
    { id: 'shop', label: 'Shop', icon: 'briefcase', active: active === 'shop', onSelect: () => navigate('lab') },
    { id: 'more', label: 'More', icon: 'menu', active: active === 'more', onSelect: openMore },
  ];
  return <BottomNav items={items} />;
}
