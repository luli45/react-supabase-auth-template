import { LucideIcon } from "lucide-react-native";
import {
  StickyNote,
  PenTool,
  Search,
  MessageCircle,
  BookOpen,
  Settings,
} from "lucide-react-native";

export const features: {
  id: string;
  icon: LucideIcon;
  route: string;
  name: string;
  description?: string;
}[] = [
  {
    id: "notes",
    icon: StickyNote,
    route: "(features)/notes",
    name: "Notes",
    description: "Create and edit notes",
  },
  {
    id: "write",
    icon: PenTool,
    route: "(features)/gemini",
    name: "Read & Write",
    description: "Detailed note taking",
  },
  {
    id: "research",
    icon: Search,
    route: "(features)/claude",
    name: "Research",
    description: "AI-powered research",
  },
  {
    id: "chat",
    icon: MessageCircle,
    route: "(features)/chatgpt",
    name: "AI Chat",
    description: "Chat with AI assistant",
  },
  {
    id: "study",
    icon: BookOpen,
    route: "(features)/openrouter",
    name: "Study",
    description: "Study materials",
  },
  {
    id: "settings",
    icon: Settings,
    route: "settings/theme",
    name: "Settings",
    description: "App preferences",
  },
];
