import Container from "@/components/common/container";
import { Colors } from "@/constants/Colors";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "@/hooks/theme/useTheme";
import { FlatList, StyleSheet, Keyboard, Platform } from "react-native";
import { PADDING } from "@/constants/AppConstants";
import Bubble from "@/components/common/chat/bubble";
import Footer from "@/components/common/chat/footer";
import Input from "@/components/common/chat/chat-input";
import { useChat } from "@/hooks/useChat";
import { Message } from "@/utils/types";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";

// Padding bottom is used to show input bar when keyboard is shown
const PADDING_BOTTOM = PADDING.lg;

interface ChatScreenBaseProps {
  endpoint: string;
}

const ChatScreenBase: React.FC<ChatScreenBaseProps> = ({ endpoint }) => {
  const { mode } = useTheme();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const height = useSharedValue(PADDING_BOTTOM);
  const [showFooter, setShowFooter] = useState(false);

  // iOS 16+ keyboard handling with native Keyboard API
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        height.value = withTiming(e.endCoordinates.height, { duration: 250 });
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        height.value = withTiming(PADDING_BOTTOM, { duration: 250 });
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [height]);

  // This is used to show input bar when keyboard is shown
  const fakeViewStyle = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
      marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  // This is used to send message to the server
  const { messages, isLoading, sendMessage, stopGenerating } = useChat({
    endpoint,
    onMessageComplete: () => {
      // This is used to show the footer after the message is sent
      setTimeout(() => {
        setShowFooter(true);
        // This is used to scroll to the bottom of the list after the message is sent
        flatListRef.current?.scrollToEnd();
      }, 600);
    },
  });

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    // This is used to hide the footer after the message is sent on previous message
    setShowFooter(false);
    const messageText = inputText.trim();
    setInputText("");

    await sendMessage({
      message: messageText,
    });
  }, [inputText, isLoading, sendMessage]);

  // This is used to render the message
  const renderMessage = useCallback(({ item }: { item: Message }) => {
    return <Bubble item={item} />;
  }, []);

  const renderFooter = useCallback(() => {
    return showFooter ? <Footer messages={messages} /> : null;
  }, [showFooter, messages]);

  return (
    <Container edges={["left", "right"]} bgColor={Colors[mode].background}>
      <FlatList
        ref={flatListRef}
        style={styles.container}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={[
          styles.messageList,
          { paddingBottom: PADDING.xxxl },
        ]}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        ListFooterComponentStyle={styles.footerComponent}
        inverted={false}
      />
      <Input
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSendMessage}
        isLoading={isLoading}
        onStop={stopGenerating}
      />
      <Animated.View style={fakeViewStyle} />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.md,
  },
  footerComponent: {
    flex: 1,
  },
});

export default ChatScreenBase;
