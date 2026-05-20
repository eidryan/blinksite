import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color:'#FF6A00', background:'#111', padding:'24px', fontFamily:'monospace', position:'fixed', inset:0, zIndex:99999, overflow:'auto', whiteSpace:'pre-wrap' }}>
          <b>🔴 Render Error. Paste this in chat:</b>{'\n\n'}
          {this.state.error.toString()}{'\n\n'}
          {this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

