import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiUploadCloud, FiFile, FiX, FiCalendar, FiHash, FiHeadphones, FiSettings } from 'react-icons/fi';
import './HomePage.css';

function HomePage() {
  const [audioFile, setAudioFile] = useState(null);
  const [meetingNumber, setMeetingNumber] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Create refs for focus handling
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  // Process selected file with validation
  const processFile = (file) => {
    if (file) {
      // Reset upload progress
      setUploadProgress(0);
      
      // Validate file type
      const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
      if (!validTypes.includes(file.type) && 
          !file.name.endsWith('.mp3') && 
          !file.name.endsWith('.wav')) {
        setError('Please select a valid audio file (.mp3 or .wav)');
        return;
      }
      
      // Validate file size (200MB limit)
      if (file.size > 200 * 1024 * 1024) {
        setError('File size exceeds 200MB limit');
        return;
      }
      
      // Simulate a brief upload progress animation for better UX
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          // Set file after "upload" is complete
          setAudioFile(file);
          setIsFileSelected(true);
          setError(null); // Clear any previous errors
        }
      }, 50);
    }
  };

  // Handle drag and drop functionality
  const handleDragOver = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.add('drag-over');
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation with more specific messages
    if (!audioFile) {
      setError('Please upload an audio file (MP3 or WAV format)');
      fileInputRef.current.focus();
      return;
    }
    
    if (!meetingNumber) {
      setError('Please enter a meeting number to identify this session');
      return;
    }
    
    if (!meetingDate) {
      setError('Please select the date when the meeting took place');
      return;
    }
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    
    // Create FormData object for the file upload
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('meeting_number', meetingNumber);
    formData.append('next_meeting_date', meetingDate);
    
    try {
      // Make the API call to the backend running in Docker
      const response = await axios.post('http://localhost:8000/process-meeting/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Add upload progress tracking
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      // Handle successful response
      setSuccessMessage('Meeting processed successfully! Your audio file has been analyzed.');
      
      // TODO: Handle the response data based on your API structure
      // For example: navigate to results page, show summary, etc.
      console.log('Response:', response.data);
      
      // Optionally reset form after successful submission
      // resetForm();
      
    } catch (err) {
      // Handle errors
      console.error('Error processing meeting:', err);
      
      if (err.response) {
        // The request was made and the server responded with an error status
        setError(`Server error: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setAudioFile(null);
    setIsFileSelected(false);
    setUploadProgress(0);
  };
  
  // Reset the form after successful submission (optional)
  const resetForm = () => {
    setAudioFile(null);
    setIsFileSelected(false);
    setMeetingNumber('');
    setMeetingDate('');
    setUploadProgress(0);
  };
  
  // Format file size into human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="meeting-summarizer">
      <div className="card">
        <header className="app-header">
          <div className="header-content">
            <div className="header-brand">
              <div className="logo-container">
                <FiHeadphones className="logo-icon" />
              </div>
              <div className="brand-text">
                <h1 className="page-title">Meeting Summarizer</h1>
                <p className="subtitle">Transform your audio recordings into actionable insights</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-button">
                <FiSettings className="header-button-icon" />
                <span>Settings</span>
              </button>
            </div>
          </div>
          
          <div className="header-tabs">
            <button className="tab-button active">Summarize</button>
            <button className="tab-button">History</button>
            <button className="tab-button">Templates</button>
          </div>
        </header>
        
        {/* Display error message if any */}
        {error && (
          <div className="notification error-message">
            <FiX className="notification-icon" />
            <p>{error}</p>
            <button 
              type="button" 
              className="close-notification"
              onClick={() => setError(null)}
            >
              <FiX />
            </button>
          </div>
        )}
        
        {/* Display success message if any */}
        {successMessage && (
          <div className="notification success-message">
            <div className="success-icon">✓</div>
            <p>{successMessage}</p>
            <button 
              type="button" 
              className="close-notification"
              onClick={() => setSuccessMessage(null)}
            >
              <FiX />
            </button>
          </div>
        )}
        
        <div className="layout-container">
          <aside className="sidebar">
            <form onSubmit={handleSubmit} className="upload-form">
              {/* Audio Upload Section */}
              <div className="form-section">
                <h2 className="section-title">
                  <span className="section-number">1</span>Upload Audio File
                </h2>
                
                <div 
                  ref={dropAreaRef}
                  className="drop-area" 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  {!isFileSelected ? (
                    <>
                      <div className="upload-icon-container">
                        <FiUploadCloud className="upload-icon" />
                      </div>
                      <p className="drop-text">Drag and drop your audio file here</p>
                      <p className="file-limit">or click to browse files</p>
                      <div className="file-types">
                        <span className="file-type">MP3</span>
                        <span className="file-type">WAV</span>
                      </div>
                      <p className="file-size-limit">Maximum file size: 200MB</p>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".mp3,.wav" 
                        onChange={handleFileChange}
                        className="file-input" 
                      />
                    </>
                  ) : (
                    <div className="selected-file">
                      <div className="file-icon-container">
                        <FiFile className="file-icon" />
                      </div>
                      <div className="file-info">
                        <span className="file-name">{audioFile.name}</span>
                        <span className="file-size">{formatFileSize(audioFile.size)}</span>
                        
                        {/* Progress bar */}
                        <div className="progress-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="remove-file" 
                        onClick={handleRemoveFile}
                        aria-label="Remove file"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Meeting Details Section */}
              <div className="form-section">
                <h2 className="section-title">
                  <span className="section-number">2</span>Meeting Details
                </h2>
                
                {/* Meeting Number Input */}
                <div className="input-group">
                  <label htmlFor="meetingNumber" className="input-label">
                    <FiHash className="input-icon" />
                    Meeting Number
                  </label>
                  <input
                    type="number"
                    id="meetingNumber"
                    value={meetingNumber}
                    onChange={(e) => setMeetingNumber(e.target.value)}
                    placeholder="Enter meeting ID (e.g., 1001)"
                    className="text-input"
                  />
                </div>

                {/* Meeting Date Input */}
                <div className="input-group">
                  <label htmlFor="meetingDate" className="input-label">
                    <FiCalendar className="input-icon" />
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    id="meetingDate"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="text-input"
                  />
                </div>
              </div>

              {/* Process Button */}
              <div className="form-section">
                <button 
                  type="submit" 
                  className="process-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Process Meeting</span>
                  )}
                </button>
              </div>
            </form>
          </aside>

          {/* Main Content Area */}
          <main className="content-area">
            {!audioFile && !isLoading && !successMessage && (
              <div className="placeholder-container">
                <div className="placeholder-icon">📝</div>
                <h3 className="placeholder-title">Ready to analyze your meeting</h3>
                <p className="placeholder-message">
                  Upload an audio file and provide meeting details to get started.
                  We'll process your recording and generate a comprehensive summary.
                </p>
                <div className="placeholder-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-text">Upload audio</div>
                  </div>
                  <div className="step-connector"></div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-text">Enter details</div>
                  </div>
                  <div className="step-connector"></div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-text">Process</div>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="processing-container">
                <div className="processing-animation">
                  <div className="processing-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
                <h3 className="processing-title">Processing Your Meeting</h3>
                <p className="processing-message">
                  We're analyzing your audio file to extract key information.
                  This may take a few moments depending on the length of your recording.
                </p>
              </div>
            )}
            
            {/* 
              TODO: Display processing results here
              This area can be used to show:
              - Summary of the meeting
              - Transcription
              - Action items
              - Other data returned from the API
              
              CUSTOMIZATION: You may want to create a separate component
              for displaying the results in a structured format
            */}
            {successMessage && !isLoading && (
              <div className="results-placeholder">
                <h3>Results will appear here</h3>
                <p>This is where your meeting summary data will be displayed after processing.</p>
                {/* 
                  CUSTOMIZATION: Replace this placeholder with actual results display
                  once you've determined the structure of your API response
                */}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default HomePage;