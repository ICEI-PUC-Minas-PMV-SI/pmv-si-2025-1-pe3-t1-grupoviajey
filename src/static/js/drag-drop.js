// Drag and Drop functionality for itinerary activities

// Initialize drag and drop for the itinerary activities
function initDragAndDrop() {
  // Get all draggable elements
  const draggables = document.querySelectorAll('.activity-card');
  const dropZones = document.querySelectorAll('.activities-container');
  
  // Add event listeners to draggable elements
  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', dragStart);
    draggable.addEventListener('dragend', dragEnd);
  });
  
  // Add event listeners to drop zones
  dropZones.forEach(dropZone => {
    dropZone.addEventListener('dragover', dragOver);
    dropZone.addEventListener('dragenter', dragEnter);
    dropZone.addEventListener('dragleave', dragLeave);
    dropZone.addEventListener('drop', drop);
  });
}

// Drag start event
function dragStart() {
  this.classList.add('dragging');
  
  // Store the source day and activity details
  this.setAttribute('data-source-day', this.closest('.day-card').getAttribute('data-day'));
  
  // Set data for the drag operation
  const activityId = this.getAttribute('data-activity-id');
  event.dataTransfer.setData('text/plain', activityId);
}

// Drag end event
function dragEnd() {
  this.classList.remove('dragging');
}

// Drag over event
function dragOver(e) {
  e.preventDefault();
  this.classList.add('drop-target');
}

// Drag enter event
function dragEnter(e) {
  e.preventDefault();
  this.classList.add('drop-target');
}

// Drag leave event
function dragLeave() {
  this.classList.remove('drop-target');
}

// Drop event
function drop(e) {
  e.preventDefault();
  this.classList.remove('drop-target');
  
  // Get the activity ID from the data transfer
  const activityId = e.dataTransfer.getData('text/plain');
  
  // Get the source day number
  const sourceDayElement = document.querySelector(`.activity-card[data-activity-id="${activityId}"]`);
  if (!sourceDayElement) return;
  
  const sourceDay = parseInt(sourceDayElement.getAttribute('data-source-day'));
  
  // Get the target day
  const targetDayElement = this.closest('.day-card');
  if (!targetDayElement) return;
  
  const targetDay = parseInt(targetDayElement.getAttribute('data-day'));
  
  // Determine position in target day (could get more sophisticated)
  const targetPosition = 0; // Default to the top
  
  // Move the activity in the data model
  moveActivity(activityId, sourceDay, 0, targetDay, targetPosition);
  
  // Re-render the days to reflect the changes
  renderDays();
}

// Move an activity from one day to another
function moveActivity(activityId, fromDay, fromTime, toDay, toTime) {
  if (!appState.currentItinerary) return;
  
  // Find the source day
  const sourceDay = appState.currentItinerary.days.find(day => day.dayNumber === fromDay);
  if (!sourceDay) return;
  
  // Find the activity in the source day
  const activityIndex = sourceDay.activities.findIndex(activity => activity.id === activityId);
  if (activityIndex === -1) return;
  
  // Get the activity
  const activity = sourceDay.activities[activityIndex];
  
  // Remove from source day
  sourceDay.activities.splice(activityIndex, 1);
  
  // Find the target day
  const targetDay = appState.currentItinerary.days.find(day => day.dayNumber === toDay);
  if (!targetDay) return;
  
  // Add to target day at the specified position
  if (toTime < targetDay.activities.length) {
    targetDay.activities.splice(toTime, 0, activity);
  } else {
    targetDay.activities.push(activity);
  }
  
  // Save changes
  saveCurrentItinerary();
}

// Remove an activity
function removeActivity(activityId) {
  if (!appState.currentItinerary) return;
  
  // Loop through all days to find the activity
  for (const day of appState.currentItinerary.days) {
    const activityIndex = day.activities.findIndex(activity => activity.id === activityId);
    if (activityIndex !== -1) {
      // Remove the activity
      day.activities.splice(activityIndex, 1);
      
      // Re-render
      renderDays();
      
      // Save changes
      saveCurrentItinerary();
      
      return;
    }
  }
}

// Initialize drag and drop when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // This will be called when screens are initialized
  // See app.js for the initialization flow
});

// Add an event listener for when days are rendered
document.addEventListener('daysRendered', function() {
  initDragAndDrop();
});