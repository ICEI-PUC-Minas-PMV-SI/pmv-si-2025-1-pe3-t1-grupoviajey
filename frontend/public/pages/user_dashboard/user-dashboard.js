import { initDashboardTabs } from './dashboard-tabs.js';
import { initDashboardTrips } from './dashboard-trips.js';
import { initDashboardEvents } from './dashboard-events.js';

document.addEventListener('DOMContentLoaded', () => {
  initDashboardTabs();
  initDashboardTrips();
  if (typeof initDashboardEvents === 'function') {
    initDashboardEvents();
  }
}); 