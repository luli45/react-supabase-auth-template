import React from "react";
import ChatScreenBase from "@/components/screen/chat";

const GeminiScreen: React.FC = () => {
  return <ChatScreenBase endpoint="ai/gemini/stream" />;
};

export default GeminiScreen;
