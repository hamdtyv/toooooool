
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import CopilotStudio from './components/copilot/CopilotStudio';
import SlowMotionScroll from './components/SlowMotionScroll';
import { JobProvider } from './contexts/JobContext';
import { AppStateProvider } from './contexts/AppStateContext';
import { ChannelProvider } from './contexts/ChannelContext';

const App: React.FC = () => {
  return (
    <AppStateProvider>
      <JobProvider>
        <ChannelProvider>
          <HashRouter>
            <SlowMotionScroll />
            <Routes>
              <Route path="/" element={<CopilotStudio />} />
              <Route path="/chat" element={<CopilotStudio />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </ChannelProvider>
      </JobProvider>
    </AppStateProvider>
  );
};

export default App;
