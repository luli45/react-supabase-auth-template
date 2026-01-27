import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStudyMaterial } from '../../hooks/useStudyMaterials';
import { aiService } from '../../services/aiService';
import { studyMaterialService } from '../../services/studyMaterialService';
import type { StudyMaterialMessage } from '../../types/studyMaterial';
import './study.css';

const SUGGESTION_QUESTIONS = [
  "What are the main concepts?",
  "Explain this in simple terms",
  "What should I focus on?",
  "Give me a quiz question",
];

export default function StudyAssistantPage() {
  const { id } = useParams<{ id: string }>();
  const { material, isLoading, error } = useStudyMaterial(id);
  const [messages, setMessages] = useState<StudyMaterialMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing summary
  useEffect(() => {
    if (material?.summary) {
      setSummary(material.summary);
    }
  }, [material]);

  // Auto-generate summary if not exists
  useEffect(() => {
    if (material && material.extracted_text && !material.summary && !isSummarizing) {
      generateSummary();
    }
  }, [material]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateSummary = async () => {
    if (!material?.extracted_text) return;

    setIsSummarizing(true);
    try {
      const response = await aiService.summarize(material.extracted_text, 'bullet-points');
      if (response.content && !response.error) {
        setSummary(response.content);
        // Save to database
        await studyMaterialService.updateMaterialSummary(material.id, response.content);
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !material?.extracted_text || isAsking) return;

    const question = inputValue.trim();
    setInputValue('');

    // Add user message
    const userMessage: StudyMaterialMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Ask AI
    setIsAsking(true);
    try {
      const response = await aiService.ask(
        material.extracted_text,
        question,
        messages
      );

      const assistantMessage: StudyMaterialMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.error || response.content || 'Sorry, I could not generate a response.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: StudyMaterialMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputValue(question);
  };

  if (isLoading) {
    return (
      <div className="study-page">
        <header className="study-header">
          <div className="container">
            <div className="study-header-content">
              <Link to="/study" className="back-link">Study Materials</Link>
              <h1>Loading...</h1>
            </div>
          </div>
        </header>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="study-page">
        <header className="study-header">
          <div className="container">
            <div className="study-header-content">
              <Link to="/study" className="back-link">Study Materials</Link>
              <h1>Material not found</h1>
            </div>
          </div>
        </header>
        <main className="study-main">
          <div className="container">
            <div className="error-state">
              <p>Could not load this study material</p>
              <Link to="/study" className="btn btn--secondary">Back to Materials</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="study-page study-assistant">
      <header className="study-header">
        <div className="container">
          <div className="study-header-content">
            <Link to="/study" className="back-link">Study Materials</Link>
            <h1>{material.title}</h1>
          </div>
        </div>
      </header>

      <div className="study-assistant-content">
        {/* Sidebar with Summary */}
        <aside className="study-sidebar">
          <div className="study-sidebar-header">
            <h2>Material Info</h2>
            <span className="material-type-badge">
              {material.file_type.toUpperCase()}
            </span>
          </div>
          <div className="study-sidebar-content">
            <div className="summary-section">
              <h3>Quick Summary</h3>
              {isSummarizing ? (
                <div className="summary-loading">
                  <span>Generating summary...</span>
                </div>
              ) : summary ? (
                <div className="summary-text">{summary}</div>
              ) : (
                <button
                  className="btn btn--secondary btn--small"
                  onClick={generateSummary}
                  disabled={!material.extracted_text}
                >
                  Generate Summary
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <h3>Ask me anything!</h3>
                <p>
                  I've read your study material and I'm ready to help you understand it better.
                </p>
                <div className="suggestion-chips">
                  {SUGGESTION_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-message chat-message--${message.role}`}
                  >
                    {message.content}
                  </div>
                ))}
                {isAsking && (
                  <div className="chat-message chat-message--assistant chat-message--loading">
                    Thinking...
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <form className="chat-input-form" onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question about this material..."
                className="chat-input"
                disabled={isAsking || !material.extracted_text}
              />
              <button
                type="submit"
                className="btn btn--accent chat-send-btn"
                disabled={!inputValue.trim() || isAsking || !material.extracted_text}
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
