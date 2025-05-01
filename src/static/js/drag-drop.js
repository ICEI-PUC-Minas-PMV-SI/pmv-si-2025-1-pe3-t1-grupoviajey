// Drag and Drop functionality for the itinerary builder

// Initialize drag and drop functionality
function initDragAndDrop() {
  // Get all draggable items
  const draggables = document.querySelectorAll('.activity-item');
  
  // Get all drop zones
  const dropZones = document.querySelectorAll('.drop-zone');
  
  // Set up drag events for draggable items
  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', dragStart);
    draggable.addEventListener('dragend', dragEnd);
  });
  
  // Set up drag events for drop zones
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', dragOver);
    zone.addEventListener('dragenter', dragEnter);
    zone.addEventListener('dragleave', dragLeave);
    zone.addEventListener('drop', drop);
  });
  
  // Set up click handlers for remove activity buttons
  document.querySelectorAll('.remove-activity-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const activityId = parseInt(this.getAttribute('data-id'));
      removeActivity(activityId);
    });
  });
}

// Drag start handler
function dragStart() {
  this.classList.add('dragging');
  
  // Store the activity ID and origin information
  const activityId = parseInt(this.getAttribute('data-id'));
  const originZone = this.closest('.drop-zone');
  const originDay = parseInt(originZone.getAttribute('data-day'));
  const originTime = originZone.getAttribute('data-time');
  
  // Store this information in the dataTransfer object
  this.setAttribute('data-origin-day', originDay);
  this.setAttribute('data-origin-time', originTime);
}

// Drag end handler
function dragEnd() {
  this.classList.remove('dragging');
}

// Drag over handler
function dragOver(e) {
  e.preventDefault();
}

// Drag enter handler
function dragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

// Drag leave handler
function dragLeave() {
  this.classList.remove('drag-over');
}

// Drop handler
function drop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  // Get the dragged element
  const draggedItem = document.querySelector('.dragging');
  if (!draggedItem) return;
  
  // Get the activity ID
  const activityId = parseInt(draggedItem.getAttribute('data-id'));
  
  // Get origin information
  const originDay = parseInt(draggedItem.getAttribute('data-origin-day'));
  const originTime = draggedItem.getAttribute('data-origin-time');
  
  // Get destination information
  const destDay = parseInt(this.getAttribute('data-day'));
  const destTime = this.getAttribute('data-time');
  
  // Move the activity in the app state
  moveActivity(activityId, originDay, originTime, destDay, destTime);
  
  // Rerender days to reflect the change
  renderDays();
}

// Move an activity from one section to another
function moveActivity(activityId, fromDay, fromTime, toDay, toTime) {
  // Find the origin day
  const originDay = appState.currentItinerary.days.find(day => day.dayNumber === fromDay);
  if (!originDay) return;
  
  // Find the activity in the origin day and time
  const activityIndex = originDay[fromTime].findIndex(activity => activity.id === activityId);
  if (activityIndex === -1) return;
  
  // Remove the activity from the origin
  const activity = originDay[fromTime].splice(activityIndex, 1)[0];
  
  // Find the destination day
  const destDay = appState.currentItinerary.days.find(day => day.dayNumber === toDay);
  if (!destDay) return;
  
  // Add the activity to the destination
  destDay[toTime].push(activity);
}

// Remove an activity
function removeActivity(activityId) {
  // Confirm before removing
  if (!confirm('Are you sure you want to remove this activity?')) {
    return;
  }
  
  // Loop through all days and time periods to find and remove the activity
  appState.currentItinerary.days.forEach(day => {
    ['morning', 'afternoon', 'evening'].forEach(time => {
      day[time] = day[time].filter(activity => activity.id !== activityId);
    });
  });
  
  // Rerender days
  renderDays();
}
