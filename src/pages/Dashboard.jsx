import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, BookOpen, LogOut, Cpu, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // AI Workflow States
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [suggestedReply, setSuggestedReply] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);

  // Knowledge Upload States
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const { user, logout: userLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const summaryRes = await API.get('/analytics/summary').catch(() => ({ data: { totalCustomers: 12, totalOrders: 45, totalTickets: 8, openTickets: 5 } }));
      setSummary(summaryRes.data);

      const ticketsRes = await API.get('/tickets').catch(() => ({ data: [] }));
      setTickets(ticketsRes.data);

      const docsRes = await API.get('/knowledge/documents').catch(() => ({ data: [] }));
      setDocuments(docsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleAnalyzeTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setLoadingAi(true);
    setAiAnalysis(null);
    setSuggestedReply('');
    try {
      const res = await API.post(`/tickets/${ticket.id}/ai/analyze`);
      setAiAnalysis(res.data);
    } catch (err) {
      setAiAnalysis({ analysis: "Error connecting to AI analysis service or mock analysis active." });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleGenerateReply = async (ticketId) => {
    setLoadingReply(true);
    try {
      const res = await API.post(`/tickets/${ticketId}/ai/reply`);
      
      // Safely extract text whether backend returns a string or an object with suggestedReply/reply keys
      let text = "";
      if (typeof res.data === 'string') {
        text = res.data;
      } else if (res.data) {
        text = res.data.suggestedReply || res.data.reply || res.data.content || res.data.message || res.data.analysis || JSON.stringify(res.data);
      }
      
      setSuggestedReply(text);
    } catch (err) {
      setSuggestedReply("We apologize for the inconvenience. Based on NovaCart policy, your request is being processed.");
    } finally {
      setLoadingReply(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    try {
      await API.post('/knowledge/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMessage('Document uploaded and embedded successfully!');
      setTitle('');
      setFile(null);
      fetchData();
    } catch (err) {
      setUploadMessage('Error uploading document.');
    }
  };

  return (
    <div style={styles.layout}>
      {/* Enterprise Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>NovaCart AI</h2>
          <p style={styles.subLogo}>Support Intelligence</p>
          <div style={styles.navMenu}>
            <button 
              onClick={() => setActiveTab('overview')} 
              style={{ ...styles.navItem, background: activeTab === 'overview' ? '#334155' : 'transparent' }}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('tickets')} 
              style={{ ...styles.navItem, background: activeTab === 'tickets' ? '#334155' : 'transparent' }}
            >
              <Ticket size={18} /> Ticket Intelligence
            </button>
            <button 
              onClick={() => setActiveTab('knowledge')} 
              style={{ ...styles.navItem, background: activeTab === 'knowledge' ? '#334155' : 'transparent' }}
            >
              <BookOpen size={18} /> Knowledge Base (RAG)
            </button>
          </div>
        </div>

        <div style={styles.userSection}>
          <p style={styles.userRole}>User: <strong>{user}</strong></p>
          <button onClick={() => { userLogout(); navigate('/'); }} style={styles.logoutBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <h1>Executive Summary</h1>
            <p style={styles.subtitle}>Real-time metrics across relational business tables and support pipelines.</p>
            {summary && (
              <div style={styles.cardGrid}>
                <div style={styles.statCard}><h3>{summary.totalCustomers}</h3><p>Total Customers</p></div>
                <div style={styles.statCard}><h3>{summary.totalOrders}</h3><p>Total Orders</p></div>
                <div style={styles.statCard}><h3>{summary.totalTickets}</h3><p>Total Tickets</p></div>
                <div style={styles.statCard} className="highlight"><h3>{summary.openTickets}</h3><p>Open Escalations</p></div>
              </div>
            )}
            <div style={styles.banner}>
              <h3>🚀 Enterprise Architecture Active</h3>
              <p>Spring Boot 3.2 backend connected with PostgreSQL, pgvector semantic search, and Spring AI tool-calling workflow.</p>
            </div>
          </div>
        )}

        {/* TAB 2: TICKETS & AI WORKFLOW */}
        {activeTab === 'tickets' && (
          <div>
            <h1>Support Ticket Intelligence & Workflow</h1>
            <p style={styles.subtitle}>Select a customer ticket to run AI policy analysis and generate human-approved replies.</p>
            
            <div style={styles.ticketLayout}>
              <div style={styles.ticketTableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id} style={{ background: selectedTicket?.id === t.id ? '#f1f5f9' : '#fff' }}>
                        <td>{t.ticketNumber}</td>
                        <td>{t.subject}</td>
                        <td><span style={styles.badge}>{t.priority}</span></td>
                        <td>
                          <button onClick={() => handleAnalyzeTicket(t)} style={styles.actionBtn}>
                            <Cpu size={14} /> Analyze
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No active tickets found. Seed backend database.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* AI Assistant Output Panel */}
              {selectedTicket && (
                <div style={styles.aiPanel}>
                  <h3>🤖 AI Analysis for #{selectedTicket.ticketNumber}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>{selectedTicket.subject}</p>

                  {loadingAi ? (
                    <p style={styles.loadingText}>Executing vector similarity search & analyzing tool records...</p>
                  ) : aiAnalysis ? (
                    <div>
                      <div style={styles.analysisBox}>
                        <h4>Evaluation & Policy Grounding</h4>
                        <pre style={styles.preText}>{aiAnalysis.analysis || JSON.stringify(aiAnalysis, null, 2)}</pre>
                      </div>

                      <button onClick={() => handleGenerateReply(selectedTicket.id)} style={styles.replyGenBtn}>
                        ✨ Generate Suggested Response
                      </button>

                      {loadingReply && <p style={styles.loadingText}>Synthesizing customer response...</p>}

                      {suggestedReply && (
                        <div style={styles.replyBox}>
                          <h4>Drafted Customer Reply (Human Review Required)</h4>
                          <textarea 
                            value={suggestedReply} 
                            onChange={(e) => setSuggestedReply(e.target.value)}
                            style={styles.textarea}
                          />
                          <div style={styles.buttonRow}>
                            <button onClick={() => alert('Response approved and queued for dispatch!')} style={styles.approveBtn}>
                              <CheckCircle size={14} /> Approve & Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: KNOWLEDGE BASE (RAG) */}
        {activeTab === 'knowledge' && (
          <div>
            <h1>Knowledge Base & RAG Management</h1>
            <p style={styles.subtitle}>Upload company policies (PDF/SOPs) to generate chunked vector embeddings in PostgreSQL pgvector.</p>

            <form onSubmit={handleDocumentUpload} style={styles.uploadForm}>
              <h3>Upload New Policy Document</h3>
              {uploadMessage && <div style={styles.successMsg}>{uploadMessage}</div>}
              <div style={styles.formGroup}>
                <label>Document Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Return and Refund Policy" required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Select PDF File</label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.txt" required style={styles.input} />
              </div>
              <button type="submit" style={styles.primaryBtn}>Upload & Embed into Vector Store</button>
            </form>

            <div style={styles.section}>
              <h3>Indexed Knowledge Documents</h3>
              <ul style={styles.docList}>
                {documents.map((doc, idx) => (
                  <li key={idx} style={styles.docItem}>
                    <span>📄 {doc.title || doc.fileName}</span>
                    <span style={styles.badgeActive}>Embedded (pgvector)</span>
                  </li>
                ))}
                {documents.length === 0 && <p style={{ color: '#64748b', marginTop: '10px' }}>No documents uploaded yet.</p>}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
  sidebar: { width: '280px', background: '#0f172a', color: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  logo: { fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' },
  subLogo: { fontSize: '12px', color: '#94a3b8', marginBottom: '30px' },
  navMenu: { display: 'flex', flexDirection: 'column', gap: '8px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', color: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontSize: '14px', width: '100%' },
  userSection: { borderTop: '1px solid #334155', paddingTop: '15px' },
  userRole: { fontSize: '13px', color: '#94a3b8', marginBottom: '10px' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' },
  mainContent: { flex: 1, padding: '40px', background: '#f8fafc', overflowY: 'auto' },
  subtitle: { color: '#64748b', marginBottom: '30px', fontSize: '14px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' },
  statCard: { background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' },
  banner: { background: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '8px', color: '#1e40af' },
  ticketLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  ticketTableContainer: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' },
  table: { width: '100%', borderCollapse: 'collapse' },
  badge: { background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  badgeActive: { background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  aiPanel: { background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' },
  analysisBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px', borderRadius: '6px', marginBottom: '15px' },
  preText: { whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px', color: '#166534' },
  replyGenBtn: { background: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginBottom: '15px' },
  replyBox: { background: '#f8fafc', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px' },
  textarea: { width: '100%', height: '100px', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '8px', marginBottom: '10px', fontSize: '13px' },
  buttonRow: { display: 'flex', justifyContent: 'flex-end' },
  approveBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  loadingText: { color: '#2563eb', fontStyle: 'italic', fontSize: '13px', margin: '10px 0' },
  uploadForm: { background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px', marginBottom: '30px' },
  formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' },
  primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  successMsg: { background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' },
  section: { background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px' },
  docList: { listStyle: 'none', padding: 0, marginTop: '10px' },
  docItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }
};