import { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { useSession } from '../../context/SessionContext';
import styles from './EditorAISidebar.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface EditorAISidebarProps {
    docText: string;
    onInsertContent: (content: string) => void;
    onClose: () => void;
}

export function EditorAISidebar({ docText, onInsertContent, onClose }: EditorAISidebarProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your writing assistant. How can I help you with this note?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Use the ask action from aiService
            const response = await aiService.ask(docText, userMessage);

            if (response.error) {
                throw new Error(response.error);
            }

            setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (action: 'summarize' | 'grammar' | 'continue') => {
        if (isLoading) return;
        setIsLoading(true);

        let prompt = '';
        let apiAction = '';

        switch (action) {
            case 'summarize':
                prompt = "Summarize this note.";
                setMessages((prev) => [...prev, { role: 'user', content: "Summarize this note." }]);
                break;
            case 'grammar':
                prompt = "Check usage of grammar and suggest improvements.";
                setMessages((prev) => [...prev, { role: 'user', content: "Fix grammar." }]);
                break;
            case 'continue':
                prompt = "Continue writing based on the current context.";
                setMessages((prev) => [...prev, { role: 'user', content: "Continue writing." }]);
                break;
        }

        try {
            // Re-using 'ask' for simplicity, but 'summarize' has its own method
            let response;
            if (action === 'summarize') {
                response = await aiService.summarize(docText);
            } else {
                response = await aiService.ask(docText, prompt);
            }

            if (response.error) throw new Error(response.error);

            setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'assistant', content: "Error executing action." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.sidebar}>
            <header className={styles.header}>
                <h3>AI Copilot</h3>
                <button onClick={onClose} className={styles.closeBtn}>×</button>
            </header>

            <div className={styles.messages}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                        <div className={styles.messageContent}>{msg.content}</div>
                        {msg.role === 'assistant' && (
                            <button
                                className={styles.insertBtn}
                                onClick={() => onInsertContent(msg.content)}
                                title="Insert into document"
                            >
                                Insert
                            </button>
                        )}
                    </div>
                ))}
                {isLoading && <div className={styles.loading}>AI is thinking...</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.quickActions}>
                <button onClick={() => handleQuickAction('summarize')} disabled={isLoading}>Summarize</button>
                <button onClick={() => handleQuickAction('grammar')} disabled={isLoading}>Fix Grammar</button>
                <button onClick={() => handleQuickAction('continue')} disabled={isLoading}>Continue</button>
            </div>

            <div className={styles.inputArea}>
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    disabled={isLoading}
                />
                <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                    ➤
                </button>
            </div>
        </div>
    );
}
