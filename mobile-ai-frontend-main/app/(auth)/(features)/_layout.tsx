import { Stack } from "expo-router";
import HeaderBack from "@/components/navigation/header/header-back";

const FeaturesStack = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: HeaderBack,
      }}
    >
      <Stack.Screen
        name="admob"
        options={{
          title: "Admob",
        }}
      />
      <Stack.Screen
        name="replicate"
        options={{
          title: "Replicate",
        }}
      />
      <Stack.Screen
        name="claude"
        options={{
          title: "Claude",
        }}
      />
      <Stack.Screen
        name="chatgpt"
        options={{
          title: "ChatGPT",
        }}
      />
      <Stack.Screen
        name="fal"
        options={{
          title: "Fal AI",
        }}
      />
      <Stack.Screen
        name="identifier"
        options={{
          title: "Identifier AI",
        }}
      />
      <Stack.Screen
        name="gemini"
        options={{
          title: "Gemini",
        }}
      />
      <Stack.Screen
        name="chatgpt-image"
        options={{
          title: "ChatGPT Image",
        }}
      />
      <Stack.Screen
        name="openrouter"
        options={{
          title: "Open Router",
        }}
      />
    </Stack>
  );
};

export default FeaturesStack;
