import { useState } from 'react';

export const useSidebar = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  return {
    activeMenu,
    sidebarOpen,
    setSidebarOpen,
    handleMenuChange
  };
};