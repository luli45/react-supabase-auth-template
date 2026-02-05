import React from "react";
import { Colors } from "@/constants/Colors";
import PressableOpacity from "@/components/common/buttons/pressable-opacity";
import { handleBack } from "@/helpers/app-functions";
import { ICON_SIZE } from "@/constants/AppConstants";
import { X } from "lucide-react-native";
import { useTheme } from "@/hooks/theme/useTheme";

const PaywallHeader = () => {
  const { mode } = useTheme();
  return (
    <PressableOpacity
      onPress={handleBack}
    >
      <X size={ICON_SIZE.md} color={Colors[mode].text} />
    </PressableOpacity>
  );
};



export default PaywallHeader;
