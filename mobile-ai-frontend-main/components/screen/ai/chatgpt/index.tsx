import React from "react";
import ChatScreenBase from "@/components/screen/chat";

const ChatGPTScreen: React.FC = () => {
  return <ChatScreenBase endpoint="ai/openai/stream" />;
};

export default ChatGPTScreen;
