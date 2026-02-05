import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { showToast } from "@/helpers/app-functions";
import { supabase } from "@/services/supabase";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  accessToken: string | null;
  initialized: boolean;
  signOutHandler: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  handleShowPassword: () => void;
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;
  handleError: (error: Error) => void;
  sendNewPasswordLink: (email: string) => Promise<void>;
  signUpAnonymously: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setInitialized(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!initialized) {
        setInitialized(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleError = useCallback((error: Error) => {
    let errorMessage = error.message;
    setError(errorMessage);
    showToast(errorMessage, "error");
  }, []);

  const handleAuthAction = useCallback(
    async (action: () => Promise<void>, loadingMessage: string) => {
      showToast(loadingMessage, "info");
      try {
        setIsLoading(true);
        setError(null);
        await action();
      } catch (error) {
        handleError(error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const signUpAnonymously = useCallback(async () => {
    await handleAuthAction(async () => {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    }, "Signing up anonymously");
  }, [handleAuthAction]);

  const signIn = useCallback(
    (email: string, password: string) =>
      handleAuthAction(async () => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }, "Signing in"),
    [handleAuthAction]
  );

  const signUp = useCallback(
    (email: string, password: string) =>
      handleAuthAction(async () => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        showToast("Check your email for verification link", "success");
      }, "Signing up"),
    [handleAuthAction]
  );

  const signOutHandler = useCallback(async () => {
    await handleAuthAction(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    }, "Signing out");
  }, [handleAuthAction]);

  const sendNewPasswordLink = useCallback(
    async (email: string) => {
      await handleAuthAction(async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        showToast("Password reset email sent", "success");
      }, "Sending reset password link");
    },
    [handleAuthAction]
  );

  const signInWithGoogle = useCallback(async () => {
    showToast("Google Sign In not yet configured for mobile", "info");
    // TODO: Implement Google OAuth with Supabase
    // const { error } = await supabase.auth.signInWithOAuth({
    //   provider: 'google',
    // });
  }, []);

  const signInWithApple = useCallback(async () => {
    showToast("Signing in with Apple", "info");
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple authentication failed - no identity token");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) throw error;
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const handleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const value = {
    user,
    session,
    accessToken: session?.access_token ?? null,
    initialized,
    signOutHandler,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    handleShowPassword,
    isLoading,
    error,
    showPassword,
    handleError,
    sendNewPasswordLink,
    signUpAnonymously,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
