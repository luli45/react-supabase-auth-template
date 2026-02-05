import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { fetch } from 'expo/fetch';
import { createSecureHeaders } from '@/helpers/api-client';
import { useAuth } from '@/context/SupabaseProvider';
import { Message, SendMessageOptions, UseChatOptions } from '@/utils/types';
import { RootState, useDispatch, useSelector } from '@/store';
import {
  addMessage,
  updateMessage,
  clearMessages,
  setIsLoading,
  setCurrentEndpoint,
} from '@/store/slices/chatSlice';
import { getApiUrl } from '@/helpers/app-functions';

export function useChat({
  endpoint,
  onError,
  onMessageComplete,
}: UseChatOptions) {
  const { user, accessToken } = useAuth();
  const userId = user?.id ?? '';
  const url = getApiUrl();
  const apiUrl = `${url}/${endpoint}`;
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Renamed cleanup function for fetch
  const abortFetchRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const addNewMessage = useCallback(
    (message: Partial<Message>) => {
      const timestamp = Date.now();
      const newMessage: Message = {
        id: `${message.isUser ? 'user' : 'ai'}-${timestamp}`,
        text: message.text || '',
        isUser: message.isUser || false,
        isLoading: message.isLoading || false,
      };
      dispatch(addMessage(newMessage));
      return newMessage;
    },
    [dispatch]
  );

  const updateExistingMessage = useCallback(
    (id: string, updates: Partial<Message>) => {
      dispatch(updateMessage({ id, updates }));
    },
    [dispatch]
  );

  const sendMessage = useCallback(
    async ({ message, onProgress }: SendMessageOptions) => {
      if (!message.trim() || isLoading) return;

      // Add user message first
      addNewMessage({
        text: message.trim(),
        isUser: true,
        isLoading: false,
      });

      // Add AI message placeholder
      const aiMessage = addNewMessage({
        text: '',
        isUser: false,
        isLoading: true,
      });

      dispatch(setIsLoading(true));
      dispatch(setCurrentEndpoint(endpoint));

      // Abort any existing fetch request before starting a new one
      abortFetchRequest();
      abortControllerRef.current = new AbortController();

      let accumulatedText = '';
      let isFirstChunk = true; // Keep track to update loading state on first actual content

      try {
        // Check for authentication token
        if (!accessToken) {
          throw new Error('Authentication token is missing. Please sign in again.');
        }

        // Format messages for context memory - include previous conversation
        // Get only last few messages to keep context size manageable
        const messageHistory = messages
          .slice(-10) // Only use last 10 messages for context
          .map((msg) => ({
            content: msg.text,
            role: msg.isUser ? 'user' : 'assistant',
          }));

        // Add current message to the history
        const currentMessage = {
          content: message,
          role: 'user',
        };

        // Construct the body with both prompt and message history
        const body = {
          prompt: message, // Keep original prompt for backwards compatibility
          messages: [...messageHistory, currentMessage], // Add conversation history
        };

        const secureHeaders = await createSecureHeaders(userId, accessToken, body);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: secureHeaders,
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          // Attempt to read error message from response body
          let errorBody = 'Request failed';
          try {
            const errorJson = await response.json();
            errorBody = errorJson.error || JSON.stringify(errorJson);
          } catch {
            // Ignore if response body is not JSON or empty
            errorBody = `Request failed with status ${response.status}`;
          }
          throw new Error(errorBody);
        }

        if (!response.body) {
          throw new Error('Response body is missing');
        }

        // Process the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // When stream is finished, process any remaining buffer content
            if (buffer.trim()) {
              // Handle case where buffer contains complete JSON but wasn't processed line by line
              // This appears to happen with the current API response format
              try {
                // Try parsing the entire buffer as JSON
                const parsedBuffer = JSON.parse(buffer);

                if (parsedBuffer.response) {
                  // Set accumulated text to the response content
                  accumulatedText = parsedBuffer.response;

                  // Update the message with the content
                  updateExistingMessage(aiMessage.id, {
                    text: accumulatedText,
                    isLoading: false,
                  });

                  // First chunk was processed
                  isFirstChunk = false;
                }
              } catch (bufferParseError) {
                // Continue to normal end-of-stream handling
              }
            }
            break; // Exit loop when stream is finished
          }

          // Decode chunk and add to buffer
          const decodedChunk = decoder.decode(value, { stream: true });
          buffer += decodedChunk;

          // Try to handle JSON format response if it doesn't look like SSE format
          if (
            !buffer.includes('data: ') &&
            buffer.trim().startsWith('{') &&
            buffer.includes('"response"')
          ) {
            try {
              // Try to parse as complete JSON object
              const parsedJson = JSON.parse(buffer);
              if (parsedJson.response) {
                // Extract response field
                accumulatedText = parsedJson.response;

                // Update the message
                if (isFirstChunk) {
                  isFirstChunk = false;
                }

                updateExistingMessage(aiMessage.id, {
                  text: accumulatedText,
                  isLoading: false,
                });

                // Clear buffer since we've processed it
                buffer = '';

                // Continue reading next chunks if any
                continue;
              }
            } catch (jsonParseError) {
              // JSON isn't complete yet, continue accumulating
            }
          }

          // Process buffer line by line (original SSE format handling)
          // This will still work if the API format changes back to SSE
          const lines = buffer.split('\n');

          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) {
              continue; // Skip non-data lines
            }

            const dataContent = line.substring('data: '.length).trim();

            if (dataContent === '[DONE]') {
              // Final update and cleanup handled after the loop
              break; // Exit processing lines for this chunk
            }

            try {
              const parsedData = JSON.parse(dataContent);

              if (parsedData.error) {
                // Treat server-sent error as stream termination
                throw new Error(parsedData.error);
              }

              if (parsedData.content) {
                // For the first chunk with actual content, update loading state
                if (isFirstChunk) {
                  updateExistingMessage(aiMessage.id, {
                    text: '', // Clear potential placeholder text if any
                    isLoading: false,
                  });
                  isFirstChunk = false;
                }

                // Append content and update message
                accumulatedText += parsedData.content;
                updateExistingMessage(aiMessage.id, {
                  text: accumulatedText,
                  isLoading: false, // Ensure loading is false once content starts arriving
                });

                // Notify progress
                onProgress?.(accumulatedText);
              }
            } catch (parseError) {
              // Decide how to handle parse errors - continue or throw?
              // Let's throw to treat it as a stream failure for now.
              throw new Error(
                `Error processing stream data: ${
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError)
                }`
              );
            }
          }
          // Check if [DONE] was received in the processed lines
          if (lines.some((line) => line === 'data: [DONE]')) {
            break; // Exit the reader loop as DONE signal received
          }
        }

        // Stream finished successfully (either by 'done' or '[DONE]' signal)
        dispatch(setIsLoading(false));
        updateExistingMessage(aiMessage.id, {
          isLoading: false,
          text:
            accumulatedText ||
            (isFirstChunk ? 'No response received' : accumulatedText), // Handle cases with no content
        });
        onMessageComplete?.();
      } catch (error: any) {
        // Check if the error was due to aborting the request
        if (error.name === 'AbortError') {
          // State is likely already handled by stopGenerating or next sendMessage call
          // We might need to update the last message state here if needed.
          // Let's assume stopGenerating handles the UI update correctly.
          dispatch(setIsLoading(false)); // Ensure loading is off
        } else {
          console.error('Chat error:', error);
          // Update the AI message placeholder with the error
          updateExistingMessage(aiMessage.id, {
            text: `Sorry, an error occurred: ${
              error.message || 'Unknown error'
            }`,
            isLoading: false,
          });
          dispatch(setIsLoading(false));
          onError?.(error);
          Alert.alert(
            'Error',
            `Failed to get response: ${error.message || 'Unknown error'}`
          );
        }
      } finally {
        // Ensure the abort controller reference is cleared after fetch completes or fails
        abortControllerRef.current = null;
      }
    },
    [
      addNewMessage,
      updateExistingMessage,
      isLoading,
      apiUrl,
      endpoint,
      onError,
      onMessageComplete,
      userId,
      accessToken,
      dispatch,
      abortFetchRequest, // Use the new abort function
    ]
  );

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const stopGenerating = useCallback(() => {
    // Call the centralized abort function
    abortFetchRequest();
    dispatch(setIsLoading(false));

    // Find the last AI message and mark it as complete/stopped
    const lastAiMessage = [...messages]
      .reverse()
      .find((msg) => !msg.isUser && msg.isLoading); // Only update if it was loading
    if (lastAiMessage) {
      updateExistingMessage(lastAiMessage.id, {
        isLoading: false,
        // Keep existing text or add a stopped message
        text: lastAiMessage.text || 'Generation stopped.',
      });
    }
    // If the last message was already complete, no UI update needed here by stopGenerating
  }, [dispatch, messages, updateExistingMessage, abortFetchRequest]); // Add abort function

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages: clearAllMessages,
    stopGenerating,
  };
}
