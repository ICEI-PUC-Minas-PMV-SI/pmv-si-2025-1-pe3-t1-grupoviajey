import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import { initDashboardTabs } from './dashboard-tabs.js';
import { initDashboardTrips } from './dashboard-trips.js';
import { initDashboardEvents } from './dashboard-events.js';

document.addEventListener('DOMContentLoaded', () => {
  includeHeader();
  includeFooter();
  includeSearchBar();
  initDashboardTabs();
  initDashboardTrips();
  if (typeof initDashboardEvents === 'function') {
    initDashboardEvents();
  }
}); 