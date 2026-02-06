import { View, StyleSheet, Text } from "react-native";
import React, { forwardRef } from "react";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/useTheme";
import { FLEX, PADDING } from "@/constants/AppConstants";

// Web fallback - native share features not available
const ShareBottomSheet = forwardRef<any, { colors: string[] }>(
  (props, ref) => {
    const { mode } = useTheme();

    return (
      <View style={[styles.container, { backgroundColor: Colors[mode].button }]}>
        <Text style={[styles.text, { color: Colors[mode].text }]}>
          Share features are only available on mobile devices
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: PADDING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ShareBottomSheet;
