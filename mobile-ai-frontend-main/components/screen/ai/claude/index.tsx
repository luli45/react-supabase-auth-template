import React from "react";
import ChatScreenBase from "@/components/screen/chat";

const ClaudeScreen: React.FC = () => {
  return <ChatScreenBase endpoint="ai/anthropic/stream" />;
};

export default ClaudeScreen;
