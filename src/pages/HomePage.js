import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Headphones, 
  Settings, 
  Upload, 
  Calendar, 
  Hash, 
  FileText, 
  X, 
  CheckCircle,
  Clock,
  BarChart2,
  List,
  Home,
  CreditCard,
  Menu,
  ChevronRight
} from 'lucide-react';
import './HomePage.css';

function HomePage({ initialTab = 'summarize' }) {
  const [audioFile, setAudioFile] = useState(null);
  const [meetingNumber, setMeetingNumber] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Create refs for focus handling
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  const tabsRef = useRef(null);
  const activeTabLineRef = useRef(null);

  // Update tab based on URL changes
  useEffect(() => {
    // Set active tab based on path
    if (location.pathname === '/') {
      setActiveTab('home');
    } else if (location.pathname === '/summarize') {
      setActiveTab('summarize');
    } else if (location.pathname === '/history') {
      setActiveTab('history');
    } else if (location.pathname === '/templates') {
      setActiveTab('templates');
    } else if (location.pathname === '/payment') {
      setActiveTab('payment');
    }
  }, [location.pathname]);
  
  // Update active tab indicator position
  useEffect(() => {
    if (tabsRef.current && activeTabLineRef.current) {
      const activeTabElement = tabsRef.current.querySelector('.active');
      if (activeTabElement) {
        const tabRect = activeTabElement.getBoundingClientRect();
        const tabsRect = tabsRef.current.getBoundingClientRect();
        
        activeTabLineRef.current.style.width = `${tabRect.width}px`;
        activeTabLineRef.current.style.left = `${tabRect.left - tabsRect.left}px`;
      }
    }
  }, [activeTab]);

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
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
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

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    
    // Update URL based on tab
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'payment') {
      navigate('/payment');
    } else {
      navigate(`/${tab}`);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="meeting-summarizer">
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="app-header">
          <div className="header-content">
            <motion.div 
              className="header-brand"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="logo-container">
                <Headphones className="logo-icon" size={24} />
              </div>
              <div className="brand-text">
                <h1 className="page-title">Meeting Summarizer</h1>
                <p className="subtitle">Transform your audio recordings into actionable insights</p>
              </div>
            </motion.div>
            
            <div className="header-actions">
              <motion.button 
                className="mobile-menu-toggle"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMobileMenu}
                aria-label="Toggle navigation menu"
              >
                <Menu size={20} />
              </motion.button>
              
              <motion.button 
                className="header-button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="header-button-icon" size={16} />
                <span>Settings</span>
              </motion.button>
            </div>
          </div>
          
          <nav className={`main-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="nav-tabs" ref={tabsRef}>
              <motion.button 
                className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => handleTabChange('home')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home size={16} className="nav-icon" />
                <span>Home</span>
              </motion.button>
              
              <motion.button 
                className={`nav-tab ${activeTab === 'summarize' ? 'active' : ''}`}
                onClick={() => handleTabChange('summarize')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart2 size={16} className="nav-icon" />
                <span>Summarize</span>
              </motion.button>
              
              <motion.button 
                className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => handleTabChange('history')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock size={16} className="nav-icon" />
                <span>History</span>
              </motion.button>
              
              <motion.button 
                className={`nav-tab ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => handleTabChange('templates')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <List size={16} className="nav-icon" />
                <span>Templates</span>
              </motion.button>
              
              <motion.button 
                className={`nav-tab ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => handleTabChange('payment')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <CreditCard size={16} className="nav-icon" />
                <span>Payment</span>
              </motion.button>
              
              <div className="nav-indicator" ref={activeTabLineRef}></div>
            </div>
          </nav>
        </header>
        
        {/* Display error message if any */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="notification error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <X className="notification-icon" size={20} />
              <p>{error}</p>
              <button 
                type="button" 
                className="close-notification"
                onClick={() => setError(null)}
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Display success message if any */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              className="notification success-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="notification-icon" size={20} />
              <p>{successMessage}</p>
              <button 
                type="button" 
                className="close-notification"
                onClick={() => setSuccessMessage(null)}
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="layout-container">
          <aside className="sidebar">
            <form onSubmit={handleSubmit} className="upload-form">
              {/* Audio Upload Section */}
              <div className="form-section">
                <h2 className="section-title">
                  <motion.span 
                    className="section-number"
                    whileHover={{ scale: 1.1 }}
                  >1</motion.span>
                  Upload Audio File
                </h2>
                
                <motion.div 
                  ref={dropAreaRef}
                  className={`drop-area ${isDragging ? 'drag-over' : ''}`}
                  whileHover={{ y: -4, boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  {!isFileSelected ? (
                    <>
                      <motion.div 
                        className="upload-icon-container"
                        animate={{ 
                          y: [0, -8, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 3,
                          repeatType: "loop",
                          ease: "easeInOut"
                        }}
                      >
                        <Upload className="upload-icon" size={32} strokeWidth={1.5} />
                      </motion.div>
                      <motion.p 
                        className="drop-text"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Drag and drop your audio file here
                      </motion.p>
                      <motion.p 
                        className="file-limit"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        or click to browse files
                      </motion.p>
                      
                      <motion.div 
                        className="file-requirements"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="file-types">
                          <span className="file-type">MP3</span>
                          <span className="file-type">WAV</span>
                        </div>
                        <motion.div 
                          className="file-size-limit"
                          whileHover={{ y: -2, boxShadow: "0 4px 8px rgba(67, 97, 238, 0.1)" }}
                        >
                          <FileText size={14} /> Maximum file size: 200MB
                        </motion.div>
                      </motion.div>
                      
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".mp3,.wav" 
                        onChange={handleFileChange}
                        className="file-input" 
                      />
                    </>
                  ) : (
                    <motion.div 
                      className="selected-file"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30,
                        duration: 0.3 
                      }}
                    >
                      <motion.div 
                        className="file-icon-container"
                        whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(67, 97, 238, 0.2)" }}
                      >
                        <FileText className="file-icon" size={22} />
                      </motion.div>
                      <div className="file-info">
                        <span className="file-name">{audioFile.name}</span>
                        <span className="file-size">
                          <motion.span 
                            animate={{ color: "var(--primary-color)" }}
                            transition={{ duration: 0.3 }}
                          >
                            {formatFileSize(audioFile.size)}
                          </motion.span>
                          {audioFile.type && ` • ${audioFile.type.split('/')[1].toUpperCase()}`}
                        </span>
                        
                        {/* Progress bar */}
                        <div className="progress-container">
                          <motion.div 
                            className="progress-bar" 
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 100, 
                              damping: 20 
                            }}
                          ></motion.div>
                        </div>
                      </div>
                      <motion.button 
                        type="button" 
                        className="remove-file" 
                        onClick={handleRemoveFile}
                        aria-label="Remove file"
                        whileHover={{ 
                          scale: 1.1, 
                          backgroundColor: "rgba(229, 62, 62, 0.1)" 
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={18} />
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Meeting Details Section */}
              <div className="form-section">
                <h2 className="section-title">
                  <motion.span 
                    className="section-number"
                    whileHover={{ scale: 1.1 }}
                  >2</motion.span>
                  Meeting Details
                </h2>
                
                {/* Meeting Number Input */}
                <div className="input-group">
                  <label htmlFor="meetingNumber" className="input-label">
                    <Hash className="input-icon" size={16} />
                    Meeting Number
                  </label>
                  <motion.input
                    type="number"
                    id="meetingNumber"
                    value={meetingNumber}
                    onChange={(e) => setMeetingNumber(e.target.value)}
                    placeholder="Enter a unique identifier (e.g. 1001)"
                    className="text-input"
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(67, 97, 238, 0.15)" }}
                  />
                  <div className="input-help-text">
                    Used to identify this meeting in your history
                  </div>
                </div>

                {/* Meeting Date Input */}
                <div className="input-group">
                  <label htmlFor="meetingDate" className="input-label">
                    <Calendar className="input-icon" size={16} />
                    Meeting Date
                  </label>
                  <motion.input
                    type="date"
                    id="meetingDate"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="text-input"
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(67, 97, 238, 0.15)" }}
                  />
                  <div className="input-help-text">
                    When the meeting took place
                  </div>
                </div>
              </div>

              {/* Process Button */}
              <div className="form-section">
                <motion.button 
                  type="submit" 
                  className="process-button"
                  disabled={isLoading || !audioFile}
                  whileHover={!isLoading && audioFile ? { y: -2, boxShadow: "0 8px 15px rgba(67, 97, 238, 0.3)" } : {}}
                  whileTap={!isLoading && audioFile ? { y: 0, boxShadow: "0 4px 6px rgba(67, 97, 238, 0.2)" } : {}}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {!audioFile ? 'Upload Audio First' : 'Process Meeting'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </aside>

          {/* Main Content Area */}
          <main className="content-area">
            <AnimatePresence mode="wait">
              {activeTab === 'summarize' && (
                <motion.div
                  key="summarize"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                  {!audioFile && !isLoading && !successMessage && (
                    <motion.div 
                      className="placeholder-container"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
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
                    </motion.div>
                  )}
                  
                  {isLoading && (
                    <motion.div 
                      className="processing-container"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="processing-animation">
                        <div className="processing-dots">
                          <motion.div 
                            className="dot"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "easeInOut"
                            }}
                          ></motion.div>
                          <motion.div 
                            className="dot"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              repeat: Infinity,
                              duration: 1.5,
                              delay: 0.5,
                              ease: "easeInOut"
                            }}
                          ></motion.div>
                          <motion.div 
                            className="dot"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              repeat: Infinity,
                              duration: 1.5,
                              delay: 1,
                              ease: "easeInOut"
                            }}
                          ></motion.div>
                        </div>
                      </div>
                      <h3 className="processing-title">Processing Your Meeting</h3>
                      <p className="processing-message">
                        We're analyzing your audio file to extract key information.
                        This may take a few moments depending on the length of your recording.
                      </p>
                    </motion.div>
                  )}
                  
                  {successMessage && !isLoading && (
                    <motion.div 
                      className="results-placeholder"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 260, 
                          damping: 20,
                          delay: 0.3
                        }}
                      >
                        <CheckCircle size={48} color="var(--success-color)" />
                      </motion.div>
                      <h3>Processing Complete</h3>
                      <p>Your meeting has been successfully analyzed.</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="placeholder-container">
                    <Clock size={48} />
                    <h3 className="placeholder-title">Meeting History</h3>
                    <p>Your past meeting summaries will appear here.</p>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'templates' && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="placeholder-container">
                    <List size={48} />
                    <h3 className="placeholder-title">Summary Templates</h3>
                    <p>Customize how your meeting summaries are formatted.</p>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="placeholder-container">
                    <Home size={48} />
                    <h3 className="placeholder-title">Welcome to Meeting Summarizer</h3>
                    <p>Your all-in-one solution for converting audio meetings into actionable text summaries.</p>
                    <motion.button 
                      className="action-button"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTabChange('summarize')}
                    >
                      <span>Get Started</span>
                      <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="placeholder-container">
                    <CreditCard size={48} />
                    <h3 className="placeholder-title">Payment & Subscription</h3>
                    <p>Manage your subscription and payment details here.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </motion.div>
    </div>
  );
}

export default HomePage;