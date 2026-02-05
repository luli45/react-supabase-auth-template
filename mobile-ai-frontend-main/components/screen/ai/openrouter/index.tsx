import React from "react";
import ChatScreenBase from "@/components/screen/chat";

const OpenRouterScreen: React.FC = () => {
  return <ChatScreenBase endpoint="ai/openrouter/stream" />;
};

export default OpenRouterScreen;
