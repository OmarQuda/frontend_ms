# Meeting Summarizer

A professional web application for processing and summarizing audio recordings of meetings. This application allows users to upload audio files and generate comprehensive meeting summaries.

## Features

- Modern, responsive UI design
- Audio file upload with drag-and-drop functionality
- Support for MP3 and WAV audio formats
- File validation and progress indication
- Meeting details input (number and date)
- Backend integration for audio processing
- Clear user feedback with loading states and notifications

## Tech Stack

- React.js for frontend UI
- React Router for navigation
- Axios for API requests
- React Icons for UI elements
- CSS with modern practices (variables, flexbox, grid)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/meeting-summarizer.git
cd meeting-summarizer
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Usage

1. Navigate to the home page
2. Upload an audio file (MP3 or WAV format, up to 200MB)
3. Enter the meeting number and date
4. Click "Process Meeting" to submit
5. View the processed results in the content area

## API Integration

The application integrates with a backend API endpoint at:
```
http://localhost:8000/process-meeting/
```

The API expects the following form data:
- `audio`: Audio file (MP3 or WAV)
- `meeting_number`: Meeting identifier
- `next_meeting_date`: Date in YYYY-MM-DD format

## Project Structure

```
meeting-summarizer/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── HomePage.css
│   │   └── PaymentPage.js
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   └── index.js
├── package.json
└── README.md
```

## Customization

The application uses CSS variables for easy theming. You can modify the colors, spacing, and other UI elements by updating the `:root` variables in `HomePage.css`.

## Deployment

To build the app for production:

```
npm run build
```

This creates an optimized production build in the `build` folder.

## Future Enhancements

- User authentication and profiles
- Meeting history tracking
- Export options for summaries (PDF, Word, etc.)
- Integration with calendar services
- Transcription preview during processing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)
