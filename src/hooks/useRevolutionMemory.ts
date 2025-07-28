import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface RevolutionChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface RevolutionConversationState {
  phase: 'gathering' | 'generating' | 'complete';
  collectedData: Record<string, any>;
  dataCategories: {
    business: Record<string, any>;
    audience: Record<string, any>;
    goals: Record<string, any>;
    resources: Record<string, any>;
    constraints: Record<string, any>;
  };
  nextQuestions: string[];
  completeness: number;
  confidenceScores: Record<string, number>;
  timestamp: string;
}

export interface RevolutionChatMemory {
  sessionId: string;
  messages: RevolutionChatMessage[];
  conversationState: RevolutionConversationState;
  lastSaved: Date;
  version: number;
}

const STORAGE_KEY = 'revolution_chat_memory';
const MAX_STORAGE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

export const useRevolutionMemory = () => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<RevolutionChatMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Generate unique session ID
  const generateSessionId = () => {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Get storage key for user
  const getUserStorageKey = useCallback((userId: string) => {
    return `${STORAGE_KEY}_${userId}`;
  }, []);

  // Clean up old sessions
  const cleanupOldSessions = useCallback(() => {
    if (!user?.id) return;

    try {
      const storageKey = getUserStorageKey(user.id);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        const age = Date.now() - new Date(data.lastSaved).getTime();
        
        if (age > MAX_STORAGE_AGE) {
          localStorage.removeItem(storageKey);
          console.log('Cleaned up old Revolution chat session');
        }
      }
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  }, [user?.id, getUserStorageKey]);

  // Load memory from localStorage
  const loadMemory = useCallback(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      cleanupOldSessions();
      
      const storageKey = getUserStorageKey(user.id);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        
        // Convert timestamp strings back to Date objects
        const parsedMemory: RevolutionChatMemory = {
          ...data,
          messages: data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          lastSaved: new Date(data.lastSaved)
        };
        
        setMemory(parsedMemory);
        console.log('Loaded Revolution chat memory:', parsedMemory.sessionId);
      } else {
        // Create new memory
        const newMemory: RevolutionChatMemory = {
          sessionId: generateSessionId(),
          messages: [],
          conversationState: {
            phase: 'gathering',
            collectedData: {},
            dataCategories: {
              business: {},
              audience: {},
              goals: {},
              resources: {},
              constraints: {}
            },
            nextQuestions: [],
            completeness: 0,
            confidenceScores: {},
            timestamp: new Date().toISOString()
          },
          lastSaved: new Date(),
          version: 1
        };
        
        setMemory(newMemory);
        console.log('Created new Revolution chat memory:', newMemory.sessionId);
      }
    } catch (error) {
      console.error('Error loading Revolution chat memory:', error);
      
      // Create fallback memory
      const fallbackMemory: RevolutionChatMemory = {
        sessionId: generateSessionId(),
        messages: [],
        conversationState: {
          phase: 'gathering',
          collectedData: {},
          dataCategories: {
            business: {},
            audience: {},
            goals: {},
            resources: {},
            constraints: {}
          },
          nextQuestions: [],
          completeness: 0,
          confidenceScores: {},
          timestamp: new Date().toISOString()
        },
        lastSaved: new Date(),
        version: 1
      };
      
      setMemory(fallbackMemory);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getUserStorageKey, cleanupOldSessions]);

  // Save memory to localStorage
  const saveMemory = useCallback((memoryToSave: RevolutionChatMemory) => {
    if (!user?.id) return;

    try {
      const storageKey = getUserStorageKey(user.id);
      const dataToSave = {
        ...memoryToSave,
        lastSaved: new Date(),
        version: memoryToSave.version + 1
      };
      
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      setHasUnsavedChanges(false);
      console.log('Saved Revolution chat memory:', dataToSave.sessionId);
      
      return dataToSave;
    } catch (error) {
      console.error('Error saving Revolution chat memory:', error);
      return memoryToSave;
    }
  }, [user?.id, getUserStorageKey]);

  // Save message
  const saveMessage = useCallback((message: RevolutionChatMessage) => {
    if (!memory) return;

    const updatedMemory = {
      ...memory,
      messages: [...memory.messages.filter(m => !m.isTyping), message]
    };

    const savedMemory = saveMemory(updatedMemory);
    if (savedMemory) {
      setMemory(savedMemory);
    }
    setHasUnsavedChanges(true);
  }, [memory, saveMemory]);

  // Update conversation state
  const updateConversationState = useCallback((newState: RevolutionConversationState) => {
    if (!memory) return;

    const updatedMemory = {
      ...memory,
      conversationState: newState
    };

    const savedMemory = saveMemory(updatedMemory);
    if (savedMemory) {
      setMemory(savedMemory);
    }
    setHasUnsavedChanges(true);
  }, [memory, saveMemory]);

  // Clear memory
  const clearMemory = useCallback(() => {
    if (!user?.id) return;

    try {
      const storageKey = getUserStorageKey(user.id);
      localStorage.removeItem(storageKey);
      
      const newMemory: RevolutionChatMemory = {
        sessionId: generateSessionId(),
        messages: [],
        conversationState: {
          phase: 'gathering',
          collectedData: {},
          dataCategories: {
            business: {},
            audience: {},
            goals: {},
            resources: {},
            constraints: {}
          },
          nextQuestions: [],
          completeness: 0,
          confidenceScores: {},
          timestamp: new Date().toISOString()
        },
        lastSaved: new Date(),
        version: 1
      };
      
      setMemory(newMemory);
      setHasUnsavedChanges(false);
      console.log('Cleared Revolution chat memory');
    } catch (error) {
      console.error('Error clearing Revolution chat memory:', error);
    }
  }, [user?.id, getUserStorageKey]);

  // Refresh memory
  const refreshMemory = useCallback(() => {
    loadMemory();
  }, [loadMemory]);

  // Auto-save effect
  useEffect(() => {
    if (!memory || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      const savedMemory = saveMemory(memory);
      if (savedMemory) {
        setMemory(savedMemory);
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearTimeout(timer);
  }, [memory, hasUnsavedChanges, saveMemory]);

  // Load memory on mount and user change
  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  return {
    memory,
    isLoading,
    hasUnsavedChanges,
    saveMessage,
    updateConversationState,
    clearMemory,
    refreshMemory
  };
};