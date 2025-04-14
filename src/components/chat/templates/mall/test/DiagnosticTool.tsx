'use client';

import React, { useState, useEffect } from 'react';
import { getAllLogs, clearLogs } from '../utils/dataLogger';
import { getCompleteResponses, clearCompleteResponses } from '../utils/networkInterceptor';

/**
 * Diagnose-Tool für die Analyse von XML-Übertragungsproblemen
 *
 * Diese Komponente zeigt die gesammelten Logs an und hilft bei der Diagnose
 * von Problemen bei der XML-Übertragung.
 */
const DiagnosticTool: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'responses'>('logs');
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Lade die Logs beim ersten Rendern und bei Änderungen
  useEffect(() => {
    loadLogs();

    // Automatische Aktualisierung
    let intervalId: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        loadLogs();
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Lade die Logs und Antworten
  const loadLogs = () => {
    const allLogs = getAllLogs();
    const allResponses = getCompleteResponses();
    setLogs(allLogs);
    setResponses(allResponses);
  };

  // Lösche alle Logs und Antworten
  const handleClearLogs = () => {
    clearLogs();
    clearCompleteResponses();
    setLogs([]);
    setResponses([]);
    setSelectedLog(null);
    setSelectedResponse(null);
  };

  // Zeige Details eines Logs an
  const handleSelectLog = (log: any) => {
    setSelectedLog(log);
    setSelectedResponse(null);
    setActiveTab('logs');
  };

  // Zeige Details einer Antwort an
  const handleSelectResponse = (response: any) => {
    setSelectedResponse(response);
    setSelectedLog(null);
    setActiveTab('responses');
  };

  // Styling für das Diagnose-Tool
  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center',
  };

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#3b1c60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const dangerButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
  };

  const logsListStyle: React.CSSProperties = {
    flex: '1',
    maxHeight: '600px',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
  };

  const logItemStyle: React.CSSProperties = {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const selectedLogStyle: React.CSSProperties = {
    flex: '2',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    maxHeight: '600px',
    overflowY: 'auto',
  };

  const codeBlockStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
    padding: '10px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    maxHeight: '300px',
  };

  const issueStyle: React.CSSProperties = {
    color: '#dc3545',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>XML-Diagnose-Tool</h1>
        <p>Dieses Tool hilft bei der Diagnose von Problemen bei der XML-Übertragung</p>
      </div>

      <div style={controlsStyle}>
        <div>
          <button style={buttonStyle} onClick={loadLogs}>
            Logs aktualisieren
          </button>
          <button style={dangerButtonStyle} onClick={handleClearLogs}>
            Logs löschen
          </button>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Automatisch aktualisieren
          </label>
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{ marginLeft: '10px' }}
            >
              <option value="1">1 Sekunde</option>
              <option value="5">5 Sekunden</option>
              <option value="10">10 Sekunden</option>
              <option value="30">30 Sekunden</option>
            </select>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          style={{
            ...buttonStyle,
            backgroundColor: activeTab === 'logs' ? '#3b1c60' : '#e0e0e0',
            color: activeTab === 'logs' ? 'white' : 'black',
          }}
          onClick={() => setActiveTab('logs')}
        >
          Logs ({logs.length})
        </button>
        <button
          style={{
            ...buttonStyle,
            backgroundColor: activeTab === 'responses' ? '#3b1c60' : '#e0e0e0',
            color: activeTab === 'responses' ? 'white' : 'black',
          }}
          onClick={() => setActiveTab('responses')}
        >
          API-Antworten ({responses.length})
        </button>
      </div>

      {activeTab === 'logs' && (
        <div style={contentStyle}>
          <div style={logsListStyle}>
            <h2>Logs ({logs.length})</h2>
            {logs.length === 0 ? (
              <p>Keine Logs vorhanden</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    ...logItemStyle,
                    backgroundColor: selectedLog === log ? '#e0e0e0' : log.issues ? '#fff8f8' : 'white',
                    border: log.issues ? '1px solid #ffcccc' : '1px solid #ddd',
                  }}
                  onClick={() => handleSelectLog(log)}
                >
                  <div>
                    <strong>Zeitstempel:</strong> {log.timestamp}
                  </div>
                  <div>
                    <strong>Phase:</strong> {log.stage}
                  </div>
                  <div>
                    <strong>Inhaltslänge:</strong> {log.contentLength} Zeichen
                  </div>
                  {log.issues && (
                    <div style={issueStyle}>
                      <strong>Probleme:</strong> {log.issues.join(', ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {selectedLog && (
            <div style={selectedLogStyle}>
              <h2>Log-Details</h2>
              <div>
                <strong>Zeitstempel:</strong> {selectedLog.timestamp}
              </div>
              <div>
                <strong>Phase:</strong> {selectedLog.stage}
              </div>
              <div>
                <strong>Inhaltslänge:</strong> {selectedLog.contentLength} Zeichen
              </div>
              <div>
                <strong>Inhalts-Hash:</strong> {selectedLog.contentHash}
              </div>

              {selectedLog.issues && (
                <div>
                  <h3 style={issueStyle}>Erkannte Probleme:</h3>
                  <ul>
                    {selectedLog.issues.map((issue: string, index: number) => (
                      <li key={index} style={issueStyle}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <h3>Inhaltsvorschau:</h3>
              <div style={codeBlockStyle}>
                {selectedLog.contentPreview}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  style={buttonStyle}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLog.contentPreview);
                    alert('Inhalt in die Zwischenablage kopiert!');
                  }}
                >
                  In Zwischenablage kopieren
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'responses' && (
        <div style={contentStyle}>
          <div style={logsListStyle}>
            <h2>API-Antworten ({responses.length})</h2>
            {responses.length === 0 ? (
              <p>Keine API-Antworten vorhanden</p>
            ) : (
              responses.map((response, index) => (
                <div
                  key={index}
                  style={{
                    ...logItemStyle,
                    backgroundColor: selectedResponse === response ? '#e0e0e0' : 'white',
                    border: '1px solid #ddd',
                  }}
                  onClick={() => handleSelectResponse(response)}
                >
                  <div>
                    <strong>Zeitstempel:</strong> {new Date(response.timestamp).toISOString()}
                  </div>
                  <div>
                    <strong>URL:</strong> {response.url.substring(0, 50)}...
                  </div>
                  <div>
                    <strong>Inhaltslänge:</strong> {response.text.length} Zeichen
                  </div>
                  <div>
                    <strong>XML-Inhalt:</strong> {response.text.includes('<intro>') || response.text.includes('<shop>') ? 'Ja' : 'Nein'}
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedResponse && (
            <div style={selectedLogStyle}>
              <h2>API-Antwort-Details</h2>
              <div>
                <strong>Zeitstempel:</strong> {new Date(selectedResponse.timestamp).toISOString()}
              </div>
              <div>
                <strong>URL:</strong> {selectedResponse.url}
              </div>
              <div>
                <strong>Inhaltslänge:</strong> {selectedResponse.text.length} Zeichen
              </div>

              <h3>Vollständiger Inhalt:</h3>
              <div style={codeBlockStyle}>
                {selectedResponse.text}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  style={buttonStyle}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedResponse.text);
                    alert('Inhalt in die Zwischenablage kopiert!');
                  }}
                >
                  In Zwischenablage kopieren
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticTool;
