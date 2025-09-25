// DOM references
const tableBody = document.querySelector("#events-table tbody");
const typeFilter = document.getElementById("type-filter");
const locationFilter = document.getElementById("location-filter");
const refreshBtn = document.getElementById("refresh-btn");
const downloadBtn = document.getElementById("download-btn");
const printBtn = document.getElementById("print-btn");
const hostSearch = document.getElementById("host-search");
const clearSearchBtn = document.getElementById("clear-search");
const multiRegionToggle = document.getElementById("multi-region-toggle");
const selectAllPracticesBtn = document.getElementById("select-all-practices");
const clearAllPracticesBtn = document.getElementById("clear-all-practices");
const totalCountSpan = document.getElementById("total-count");
const filteredCountSpan = document.getElementById("filtered-count");
const hostFilterSearch = document.getElementById("host-filter-search");
const expandAllHostsBtn = document.getElementById("expand-all-hosts");
const collapseAllHostsBtn = document.getElementById("collapse-all-hosts");

// State variables
let currentEvents = [];
let isMultiRegionEnabled = false;

// Utility: Check if event is in the future
function isFutureEvent(dateStr) {
  console.log("isFutureEvent: Checking date:", dateStr);
  
  if (!dateStr || dateStr.toLowerCase() === "ongoing") {
    console.log("isFutureEvent: Date is ongoing or empty, returning true");
    return true;
  }

  const today = new Date();
  console.log("isFutureEvent: Today's date:", today);

  // Extract first date from range (e.g., "Nov 5–9, 2025" → "Nov 5, 2025")
  const cleaned = dateStr.split("–")[0].trim();
  const yearMatch = dateStr.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : today.getFullYear();
  const parsedDate = Date.parse(`${cleaned}, ${year}`);
  
  console.log("isFutureEvent: Cleaned date:", cleaned);
  console.log("isFutureEvent: Year:", year);
  console.log("isFutureEvent: Parsed date:", new Date(parsedDate));
  console.log("isFutureEvent: Is future?", !isNaN(parsedDate) && parsedDate >= today);

  return !isNaN(parsedDate) && parsedDate >= today;
}

// Utility: Get practice badges HTML
function getPracticeBadges(practices) {
  if (!practices || practices.length === 0) return '<span class="no-practice">—</span>';
  
  return practices.map(practice => {
    const className = practice.toLowerCase();
    const icons = {
      'organic': '🌿',
      'sustainable': '♻️',
      'regenerative': '🌱'
    };
    return `<span class="practice-badge ${className}">${icons[className] || '🌾'} ${practice}</span>`;
  }).join(' ');
}

// Utility: Get type icon
function getTypeIcon(type) {
  const icons = {
    'Field Day': '🌱',
    'Workshop': '🔧',
    'Listening Session': '👂',
    'Policy Meeting': '📋',
    'Conference': '🎯',
    'Training': '📚',
    'Festival': '🎉',
    'Dinner': '🍽️',
    'Forum': '💬'
  };
  return icons[type] || '📅';
}

// Update event counts
function updateEventCounts(filteredCount) {
  totalCountSpan.textContent = `Total Events: ${currentEvents.length}`;
  filteredCountSpan.textContent = `Showing: ${filteredCount}`;
}

// Render events to table
function renderEvents(eventList) {
  tableBody.innerHTML = "";
  
  if (eventList.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7" class="no-events">No upcoming agriculture events found matching your criteria.</td>`;
    tableBody.appendChild(row);
    updateEventCounts(0);
    return;
  }

  eventList.forEach(e => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="date-cell">${e.date}</td>
      <td class="event-cell">${e.event}</td>
      <td class="location-cell">${e.location}</td>
      <td class="type-cell">${getTypeIcon(e.type)} ${e.type}</td>
      <td class="practice-cell">${getPracticeBadges(e.practice)}</td>
      <td class="org-cell">${e.organization}</td>
      <td class="details-cell"><a href="${e.link}" target="_blank" rel="noopener">More info</a></td>
    `;
    tableBody.appendChild(row);
  });

  updateEventCounts(eventList.length);
}

// Get selected regions (handles both single and multi-select)
function getSelectedRegions() {
  if (!isMultiRegionEnabled) {
    return locationFilter.value === "all" ? [] : [locationFilter.value];
  } else {
    const selected = Array.from(locationFilter.selectedOptions).map(option => option.value);
    return selected.includes("all") ? [] : selected;
  }
}

// Apply filters
function applyFilters() {
  const selectedType = typeFilter.value;
  const selectedRegions = getSelectedRegions();
  const selectedPractices = Array.from(document.querySelectorAll(".practice-option:checked")).map(cb => cb.value);
  const searchTerm = hostSearch.value.toLowerCase().trim();

  const filtered = currentEvents.filter(e => {
    // Type filter
    const typeMatch = selectedType === "all" || e.type === selectedType;
    
    // Region filter
    const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(e.region);
    
    // Practice filter
    const practiceMatch = selectedPractices.length === 0 || 
      (e.practice && selectedPractices.some(p => e.practice.includes(p)));
    
    // Host search filter
    const hostMatch = searchTerm === "" || e.organization.toLowerCase().includes(searchTerm);

    return typeMatch && regionMatch && practiceMatch && hostMatch;
  });

  renderEvents(filtered);
}

// Toggle multi-region selection
function toggleMultiRegion() {
  isMultiRegionEnabled = !isMultiRegionEnabled;
  
  if (isMultiRegionEnabled) {
    locationFilter.setAttribute('multiple', 'multiple');
    locationFilter.size = Math.min(locationFilter.options.length, 6);
    multiRegionToggle.textContent = 'Disable Multi-Select';
    multiRegionToggle.classList.add('active');
  } else {
    locationFilter.removeAttribute('multiple');
    locationFilter.size = 1;
    multiRegionToggle.textContent = 'Enable Multi-Select';
    multiRegionToggle.classList.remove('active');
    // Reset to single selection
    locationFilter.selectedIndex = 0;
  }
  
  applyFilters();
}

// Select all practices
function selectAllPractices() {
  document.querySelectorAll(".practice-option").forEach(cb => {
    cb.checked = true;
  });
  applyFilters();
}

// Clear all practices
function clearAllPractices() {
  document.querySelectorAll(".practice-option").forEach(cb => {
    cb.checked = false;
  });
  applyFilters();
}

// Clear host search
function clearHostSearch() {
  hostSearch.value = "";
  applyFilters();
}

// Refresh from backend
refreshBtn.addEventListener("click", async () => {
  refreshBtn.disabled = true;
  refreshBtn.textContent = "🔄 Refreshing...";
  
  try {
    const response = await fetch("/scrape-events");
    const scrapedEvents = await response.json();
    currentEvents = scrapedEvents.filter(e => isFutureEvent(e.date));
    applyFilters();
    
    // Update last updated time
    document.getElementById('last-updated').textContent = new Date().toLocaleDateString();
  } catch (error) {
    console.error("Failed to refresh events:", error);
    // Keep using fallback events
    currentEvents = fallbackEvents.filter(e => isFutureEvent(e.date));
    applyFilters();
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "🔄 Refresh Events";
  }
});

// CSV download
downloadBtn.addEventListener("click", () => {
  console.log("CSV Download: Starting download process");
  console.log("CSV Download: Current events count:", currentEvents.length);
  
  const headers = ["Date", "Event", "Location", "Type", "Practice", "Organization", "Details"];
  const selectedType = typeFilter.value;
  const selectedRegions = getSelectedRegions();
  const selectedPractices = Array.from(document.querySelectorAll(".practice-option:checked")).map(cb => cb.value);
  const searchTerm = hostSearch.value.toLowerCase().trim();

  console.log("CSV Download: Filters applied:", {
    selectedType,
    selectedRegions,
    selectedPractices,
    searchTerm
  });

  // If currentEvents is empty, use all fallback events regardless of date
  let eventsToFilter = currentEvents.length > 0 ? currentEvents : fallbackEvents;
  console.log("CSV Download: Using events source:", eventsToFilter.length > 0 ? "currentEvents" : "fallbackEvents");
  console.log("CSV Download: Events to filter count:", eventsToFilter.length);

  const filtered = eventsToFilter.filter(e => {
    const typeMatch = selectedType === "all" || e.type === selectedType;
    const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(e.region);
    const practiceMatch = selectedPractices.length === 0 || 
      (e.practice && selectedPractices.some(p => e.practice.includes(p)));
    const hostMatch = searchTerm === "" || e.organization.toLowerCase().includes(searchTerm);

    return typeMatch && regionMatch && practiceMatch && hostMatch;
  });

  console.log("CSV Download: Filtered events count:", filtered.length);
  console.log("CSV Download: Sample filtered event:", filtered[0]);

  const rows = filtered.map(e => [
    e.date || '',
    e.event || '',
    e.location || '',
    e.type || '',
    e.practice ? e.practice.join(', ') : '',
    e.organization || '',
    e.link || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  )].join('\n');
  console.log("CSV Download: CSV content preview:", csvContent.substring(0, 200) + "...");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `agriculture_events_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log("CSV Download: Download completed");
});

// Print view
printBtn.addEventListener("click", () => {
  window.print();
});

// Event listeners
typeFilter.addEventListener("change", applyFilters);
locationFilter.addEventListener("change", applyFilters);
hostSearch.addEventListener("input", applyFilters);
clearSearchBtn.addEventListener("click", clearHostSearch);
multiRegionToggle.addEventListener("click", toggleMultiRegion);
selectAllPracticesBtn.addEventListener("click", selectAllPractices);
clearAllPracticesBtn.addEventListener("click", clearAllPractices);

// Practice filter listeners
document.querySelectorAll(".practice-option").forEach(cb => {
  cb.addEventListener("change", applyFilters);
});

// Fallback data with enhanced structure
const fallbackEvents = [
  {
    date: "October 4, 2025",
    event: "Hoes Down Harvest Festival",
    location: "Guinda, CA",
    region: "Northern CA",
    type: "Festival",
    practice: ["Organic", "Regenerative"],
    organization: "Full Belly Farm",
    link: "https://www.fullbellyfarm.com/hoes-down-harvest-festival/"
  },
  {
    date: "November 5–9, 2025",
    event: "R-Soil 2025 Conference",
    location: "Virtual",
    region: "Virtual",
    type: "Conference",
    practice: ["Regenerative", "Sustainable"],
    organization: "Matt Powers",
    link: "https://matt-powers.mykajabi.com/r-soil"
  },
  {
    date: "February 11–13, 2026",
    event: "World Ag Expo",
    location: "Tulare, CA",
    region: "Central Valley",
    type: "Conference",
    practice: ["Sustainable"],
    organization: "International Agri-Center",
    link: "https://www.worldagexpo.com/"
  },
  {
    date: "January 21–22, 2026",
    event: "EcoFarm Conference",
    location: "Pacific Grove, CA",
    region: "Bay Area",
    type: "Conference",
    practice: ["Organic", "Regenerative"],
    organization: "EcoFarm",
    link: "https://eco-farm.org/"
  },
  {
    date: "Ongoing",
    event: "Soil Advocate Training (Online)",
    location: "Virtual",
    region: "Virtual",
    type: "Training",
    practice: ["Regenerative", "Sustainable"],
    organization: "Kiss the Ground",
    link: "https://kisstheground.com/education/soil-advocate-training/"
  },
  {
    date: "March 15, 2026",
    event: "Sustainable Viticulture Workshop",
    location: "Napa, CA",
    region: "Bay Area",
    type: "Workshop",
    practice: ["Sustainable", "Organic"],
    organization: "UC Davis Extension",
    link: "https://extension.ucdavis.edu/"
  },
  {
    date: "April 8, 2026",
    event: "Regenerative Grazing Field Day",
    location: "Paso Robles, CA",
    region: "Central Valley",
    type: "Field Day",
    practice: ["Regenerative"],
    organization: "Paicines Ranch",
    link: "https://paicinesranch.com/"
  }
];

// Host data with enhanced structure
const hostData = [
  {
    name: "CDFA (California Department of Food & Agriculture)",
    description: "State agency promoting sustainable agriculture and food safety",
    website: "https://www.cdfa.ca.gov/",
    events: [
      {
        date: "October 2, 2025",
        title: "State Board Meeting",
        link: "https://www.cdfa.ca.gov/LiveMediaStream.html"
      },
      {
        date: "November 6, 2025",
        title: "Ag Vision Listening Session",
        link: "https://www.cdfa.ca.gov/"
      }
    ]
  },
  {
    name: "EcoFarm",
    description: "Leading organization promoting ecological farming practices",
    website: "https://eco-farm.org/",
    events: [
      {
        date: "January 21–22, 2026",
        title: "EcoFarm Conference",
        link: "https://eco-farm.org/"
      }
    ]
  },
  {
    name: "Paicines Ranch",
    description: "Regenerative agriculture demonstration ranch",
    website: "https://paicinesranch.com/",
    events: [
      {
        date: "February 20–21, 2025",
        title: "Regenerative Viticulture Immersion",
        link: "https://visitsanbenito.org/organizer/paicines-ranch/"
      },
      {
        date: "April 8, 2026",
        title: "Regenerative Grazing Field Day",
        link: "https://paicinesranch.com/"
      }
    ]
  },
  {
    name: "Burroughs Family Farms",
    description: "Family farm focusing on sustainable tree nut production",
    website: "https://burroughsfamilyfarms.com/",
    events: [
      {
        date: "August 11, 2025",
        title: "Orchard Tour & Lunch",
        link: "https://www.eventbrite.com/e/orchard-tour-and-lunch-at-burroughs-family-farms-tickets-1549199971819"
      },
      {
        date: "December 16, 2024",
        title: "Listening Session",
        link: "https://www.sjvtandv.com/upcoming-events/regenerative-agriculture-information-and-listening-session-tree-nut"
      }
    ]
  },
  {
    name: "World Ag Expo (International Agri-Center)",
    description: "World's largest annual agricultural exposition",
    website: "https://www.worldagexpo.com/",
    events: [
      {
        date: "February 11–13, 2026",
        title: "World Ag Expo",
        link: "https://www.worldagexpo.com/"
      }
    ]
  },
  {
    name: "Matt Powers / R-Soil",
    description: "Regenerative agriculture educator and conference organizer",
    website: "https://matt-powers.mykajabi.com/",
    events: [
      {
        date: "November 5–9, 2025",
        title: "R-Soil 2025 Conference",
        link: "https://matt-powers.mykajabi.com/r-soil"
      }
    ]
  },
  {
    name: "Full Belly Farm",
    description: "Organic farm hosting educational events and festivals",
    website: "https://www.fullbellyfarm.com/",
    events: [
      {
        date: "October 4, 2025",
        title: "Hoes Down Harvest Festival",
        link: "https://www.fullbellyfarm.com/hoes-down-harvest-festival/"
      }
    ]
  }
];

// Host accordion functionality
function renderHostAccordion() {
  const container = document.getElementById("host-accordion");
  const searchTerm = hostFilterSearch.value.toLowerCase().trim();
  
  container.innerHTML = "";

  const filteredHosts = hostData.filter(host => 
    searchTerm === "" || host.name.toLowerCase().includes(searchTerm)
  );

  if (filteredHosts.length === 0) {
    container.innerHTML = '<li class="no-hosts">No hosts found matching your search.</li>';
    return;
  }

  filteredHosts.forEach((host, index) => {
    const li = document.createElement("li");
    li.className = "host-item";
    li.innerHTML = `
      <div class="host-header" onclick="toggleHost(${index})">
        <span class="host-name">${host.name}</span>
        <span class="host-toggle">▼</span>
      </div>
      <div class="host-events" id="host-events-${index}">
        <p class="host-description">${host.description}</p>
        <p class="host-website"><a href="${host.website}" target="_blank" rel="noopener">Visit Website</a></p>
        <h4>Upcoming Events:</h4>
        <ul class="event-list">
          ${host.events.map(event => `
            <li class="event-item">
              <span class="event-date">${event.date}</span>
              <a href="${event.link}" target="_blank" rel="noopener" class="event-title">${event.title}</a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    container.appendChild(li);
  });
}

// Toggle individual host accordion
function toggleHost(index) {
  const eventsDiv = document.getElementById(`host-events-${index}`);
  const toggle = eventsDiv.previousElementSibling.querySelector('.host-toggle');
  
  if (eventsDiv.style.display === 'block') {
    eventsDiv.style.display = 'none';
    toggle.textContent = '▼';
  } else {
    eventsDiv.style.display = 'block';
    toggle.textContent = '▲';
  }
}

// Expand all hosts
function expandAllHosts() {
  document.querySelectorAll('.host-events').forEach(events => {
    events.style.display = 'block';
  });
  document.querySelectorAll('.host-toggle').forEach(toggle => {
    toggle.textContent = '▲';
  });
}

// Collapse all hosts
function collapseAllHosts() {
  document.querySelectorAll('.host-events').forEach(events => {
    events.style.display = 'none';
  });
  document.querySelectorAll('.host-toggle').forEach(toggle => {
    toggle.textContent = '▼';
  });
}

// Host control event listeners
hostFilterSearch.addEventListener("input", renderHostAccordion);
expandAllHostsBtn.addEventListener("click", expandAllHosts);
collapseAllHostsBtn.addEventListener("click", collapseAllHosts);

// Make toggleHost function global for onclick handlers
window.toggleHost = toggleHost;

// Initialize application
console.log("App Initialization: Total fallback events:", fallbackEvents.length);
console.log("App Initialization: Sample fallback event:", fallbackEvents[0]);

currentEvents = fallbackEvents.filter(e => isFutureEvent(e.date));
console.log("App Initialization: Future events after filtering:", currentEvents.length);
console.log("App Initialization: Sample current event:", currentEvents[0]);

renderEvents(currentEvents);
renderHostAccordion();