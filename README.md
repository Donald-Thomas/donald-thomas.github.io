# Regenerative Agriculture Events Calendar

A comprehensive web application for discovering and tracking regenerative agriculture events, workshops, and educational opportunities in California.

## Features

- 📅 **Event Discovery**: Browse upcoming regenerative agriculture events
- 🔍 **Advanced Filtering**: Filter by event type, practice, location, organization, and date range
- 📱 **Progressive Web App**: Install on mobile devices for offline access
- 📥 **CSV Export**: Download event data for external use
- 🖨️ **Print-Friendly**: Optimized print view for event listings
- 🌱 **Regenerative Focus**: Curated content focused on sustainable farming practices

## Event Types

- Conferences
- Workshops
- Field Days
- Training Sessions
- Festivals

## Regenerative Practices Covered

- Cover Crops
- Composting
- No-Till Farming
- Rotational Grazing
- Soil Health
- Biodiversity
- Water Conservation
- Carbon Sequestration
- Integrated Pest Management
- Agroforestry
- Permaculture
- Organic Farming

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **PWA**: Service Worker for offline functionality
- **Icons**: SVG-based scalable icons
- **Responsive Design**: Mobile-first approach

## Installation

### GitHub Pages Deployment

This application is designed to be deployed on GitHub Pages:

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Select the main branch as the source
4. The application will be available at `https://yourusername.github.io/repository-name`

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Donald-Thomas/donald-thomas.github.io.git
   ```

2. Open `index.html` in a web browser or serve with a local HTTP server:
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx serve .
   ```

3. Navigate to `http://localhost:8080`

## File Structure

```
├── index.html          # Main application HTML
├── app.js             # Application JavaScript
├── styles.css         # Application styles
├── manifest.json      # PWA manifest
├── sw.js             # Service worker
├── icons/            # Application icons
│   ├── icon.svg
│   ├── icon-72x72.svg
│   ├── icon-96x96.svg
│   ├── icon-128x128.svg
│   ├── icon-144x144.svg
│   ├── icon-152x152.svg
│   ├── icon-192x192.svg
│   ├── icon-384x384.svg
│   └── icon-512x512.svg
└── README.md         # This file
```

## Usage

### Browsing Events

1. Open the application in your web browser
2. Events are automatically loaded and displayed
3. Use the filter controls to narrow down events by:
   - Event type (Conference, Workshop, Field Day, etc.)
   - Regenerative practice
   - Location
   - Organization
   - Date range

### Exporting Data

- Click the "📥 Download CSV" button to export filtered events
- The CSV file includes all event details and can be opened in Excel or other spreadsheet applications

### Installing as PWA

1. Open the application in a supported browser (Chrome, Firefox, Safari)
2. Look for the "Install" prompt or use the browser's "Add to Home Screen" option
3. The app will be available offline with limited functionality

## Contributing

We welcome contributions to improve the calendar and add new events:

1. **Submit Events**: Email event details to [events@example.com]
2. **Report Issues**: Use GitHub Issues to report bugs or suggest features
3. **Code Contributions**: Fork the repository and submit pull requests

### Event Submission Format

When submitting events, please include:
- Event name and description
- Date and time
- Location (city, venue)
- Event type and regenerative practices covered
- Organizing institution
- Registration link or contact information

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

- **Project Maintainer**: Don Thomas
- **Email**: [contact@example.com]
- **GitHub**: [@Donald-Thomas](https://github.com/Donald-Thomas)

## Acknowledgments

- Event data sourced from various California agricultural organizations
- Icons designed for agricultural and sustainability themes
- Built with accessibility and mobile-first principles

---

Made with 🌱 for sustainable farming communities in California.