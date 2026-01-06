import { useState, useCallback } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ChatHistory } from '@/components/ChatHistory';
import { ChatPanel } from '@/components/ChatPanel';
import { Canvas } from '@/components/Canvas';
import { SourcesPanel } from '@/components/SourcesPanel';
import { TopBar } from '@/components/TopBar';
import {
  type ChatSession,
  type Message,
  type CanvasContent,
  type Settings,
  type LLMModel,
  type FileAttachment,
  DEFAULT_SETTINGS,
  LLM_MODELS,
} from '@/types/research';

const generateId = () => Math.random().toString(36).substring(2, 9);

const DEMO_SESSIONS: ChatSession[] = [
  {
    id: '1',
    title: 'Quantum Computing Research',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Explain quantum entanglement and its applications',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 'm2',
        role: 'agent',
        content: 'Quantum entanglement is a phenomenon where two or more particles become interconnected in such a way that the quantum state of each particle cannot be described independently...',
        timestamp: new Date(Date.now() - 3500000),
        sources: [
          { title: 'Nature Physics', url: 'https://nature.com' },
          { title: 'arXiv', url: 'https://arxiv.org' },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3500000),
  },
  {
    id: '2',
    title: 'Machine Learning Optimization',
    messages: [],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  },
];

const DEMO_CANVAS: CanvasContent[] = [
  {
    id: 'c1',
    type: 'code',
    title: 'quantum_sim.py',
    language: 'python',
    content: `import numpy as np
from qiskit import QuantumCircuit, execute, Aer

def create_entangled_pair():
    """Create a Bell state (entangled pair)"""
    qc = QuantumCircuit(2, 2)
    
    # Apply Hadamard gate to first qubit
    qc.h(0)
    
    # Apply CNOT gate
    qc.cx(0, 1)
    
    # Measure both qubits
    qc.measure([0, 1], [0, 1])
    
    return qc

# Execute the circuit
circuit = create_entangled_pair()
simulator = Aer.get_backend('qasm_simulator')
result = execute(circuit, simulator, shots=1000).result()
counts = result.get_counts()
print(counts)`,
  },
  {
    id: 'c2',
    type: 'report',
    title: 'Research Summary',
    content: `# Quantum Entanglement: A Deep Dive

## Overview
Quantum entanglement represents one of the most fascinating phenomena in quantum mechanics, challenging our classical understanding of physics.

## Key Findings

### 1. Non-locality
Entangled particles exhibit correlations that cannot be explained by classical physics. Measurements on one particle instantaneously affect its entangled partner.

### 2. Applications
- **Quantum Computing**: Enables quantum gates and algorithms
- **Quantum Cryptography**: Provides theoretically unbreakable encryption
- **Quantum Teleportation**: Transfers quantum states between locations

## Conclusion
Entanglement remains a cornerstone of quantum information science with growing practical applications.`,
  },
];

export default function Index() {
  const [sessions, setSessions] = useState<ChatSession[]>(DEMO_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(DEMO_SESSIONS[0].id);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [selectedModel, setSelectedModel] = useState<LLMModel>(LLM_MODELS[0]);
  const [canvasContents, setCanvasContents] = useState<CanvasContent[]>(DEMO_CANVAS);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showCanvas, setShowCanvas] = useState(true);
  const [showSources, setShowSources] = useState(true);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Research',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(sessions[0]?.id || null);
    }
  }, [activeSessionId, sessions]);

  const handleSendMessage = useCallback(async (content: string, attachments?: FileAttachment[]) => {
    if (!activeSessionId) {
      handleNewSession();
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? {
              ...session,
              messages: [...session.messages, userMessage],
              title: session.messages.length === 0 ? content.slice(0, 40) : session.title,
              updatedAt: new Date(),
            }
          : session
      )
    );

    setIsLoading(true);

    // Simulate agent response
    setTimeout(() => {
      const attachmentInfo = attachments && attachments.length > 0
        ? `\n\nI've received ${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}. I'll analyze these documents as part of my research.`
        : '';

      const agentMessage: Message = {
        id: generateId(),
        role: 'agent',
        content: `I've analyzed your query about "${content.slice(0, 50)}..."${attachmentInfo}\n\nBased on my research across multiple sources, here are the key findings:\n\n1. **Primary Insight**: This topic has significant implications in the current landscape.\n\n2. **Supporting Evidence**: Multiple peer-reviewed sources corroborate these findings.\n\n3. **Practical Applications**: There are several real-world use cases worth exploring.\n\nWould you like me to dive deeper into any specific aspect?`,
        timestamp: new Date(),
        sources: [
          { title: 'Wikipedia', url: 'https://wikipedia.org' },
          { title: 'Research Paper', url: 'https://arxiv.org' },
        ],
      };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                messages: [...session.messages, agentMessage],
                updatedAt: new Date(),
              }
            : session
        )
      );
      setIsLoading(false);
    }, 2000);
  }, [activeSessionId, handleNewSession]);

  const handleRemoveCanvasContent = useCallback((id: string) => {
    setCanvasContents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <TopBar
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        settings={settings}
        onSettingsChange={setSettings}
        showHistory={showHistory}
        showCanvas={showCanvas}
        showSources={showSources}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onToggleCanvas={() => setShowCanvas(!showCanvas)}
        onToggleSources={() => setShowSources(!showSources)}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {showHistory && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
              <ChatHistory
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={setActiveSessionId}
                onNewSession={handleNewSession}
                onDeleteSession={handleDeleteSession}
              />
            </ResizablePanel>
            <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
          </>
        )}

        <ResizablePanel defaultSize={showHistory && showCanvas ? 40 : showHistory || showCanvas ? 55 : 100}>
          <ChatPanel
            messages={activeSession?.messages || []}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </ResizablePanel>

        {showSources && (
          <>
            <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
            <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
              <SourcesPanel messages={activeSession?.messages || []} />
            </ResizablePanel>
          </>
        )}

        {showCanvas && (
          <>
            <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <Canvas contents={canvasContents} onRemoveContent={handleRemoveCanvasContent} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
