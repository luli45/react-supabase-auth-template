//! -- You need to start with Development Build --
// If you want to use Admob, RevenueCat, Google Sign In, you need to activate this packages.
// Please follow the instructions: https://docs.shipmobilefast.com/

import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack } from "expo-router";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";
import "@/i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store } from "../store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";
import { getUserTrackingPermission } from "../helpers/app-functions";
import { usePushNotification } from "../hooks/usePushNotification";
import { useTheme } from "../hooks/theme/useTheme";
import { AuthProvider, useAuth } from "../context/SupabaseProvider";
import { FLEX } from "../constants/AppConstants";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

//* If you want to use RevenueCat, uncomment the following lines 👇
// import {
//   RevenueCatProvider,
//   useRevenueCat,
// } from '@/context/RevenueCatProvider';

//TODO: 1. If you want to use Admob, uncomment the following lines 👇
// import { useAdmob } from '@/hooks/useAdmob';

SplashScreen.preventAutoHideAsync();

function MainLayout() {
  usePushNotification();
  const { statusBarStyle, statusBarBackgroundColor, theme } = useTheme();
  //TODO: If you want to use Admob, uncomment the following lines 👇
  // const { admobState, initializeAdmobService } = useAdmob();

  const { initialized, user } = useAuth();
  const isLoggedIn = !!user;

  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    // Add more fonts here if needed
  });

  useEffect(() => {
    // Get user tracking permission
    // This function is important for compliance with privacy regulations
    //TODO: If you don't want to use Admob, delete the following lines 👇
    // initializeAdmobService();

    // Dont remove it , because Apple will reject the app if this is not implemented
    // You should configure this function according to your needs.
    getUserTrackingPermission();
  }, []);

  useEffect(() => {
    //TODO: If you want to use Admob, uncomment the following lines 👇
    // if (loaded && initialized && admobState.admobReady.isLoaded) {
    if (loaded && initialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, initialized]);

  if (!loaded || !initialized) {
    return <Slot />;
  }

  return (
    <ThemeProvider value={theme}>
      <StatusBar
        style={statusBarStyle}
        animated={true}
        backgroundColor={statusBarBackgroundColor}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(no-auth)" />
        </Stack.Protected>

        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

const RootLayout = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        {/* TODO: If you want to use RevenueCat, uncomment the following lines 👇 */}
        {/* <RevenueCatProvider> */}
        <GestureHandlerRootView style={{ flex: FLEX.one }}>
          <BottomSheetModalProvider>
            <KeyboardProvider>
              <MainLayout />
              <Toaster />
            </KeyboardProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
        {/* </RevenueCatProvider> */}
        {/* TODO: If you want to use RevenueCat, uncomment the following lines 👆 */}
      </AuthProvider>
    </Provider>
  );
};

export default RootLayout;
