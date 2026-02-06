import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Camera } from "lucide-react-native";
import { router } from "expo-router";
import PressableOpacity from "@/components/common/buttons/pressable-opacity";
import { Colors } from "@/constants/Colors";

const CameraView = () => {
  return (
    <View style={styles.container}>
      <Camera size={64} color="#666" />
      <Text style={styles.title}>Camera Not Available</Text>
      <Text style={styles.subtitle}>
        Camera features are only available on mobile devices
      </Text>
      <PressableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </PressableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.light.primary || '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CameraView;
