import { StyleSheet, ScrollView, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/common/typography";
import { ThemedView } from "@/components/common/view";
import { Href, router } from "expo-router";
import {
  PenTool,
  Search,
  StickyNote,
  FileText,
  Grid3X3,
  ChevronRight,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/useTheme";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/SupabaseProvider";
import { notesService, Note } from "@/services/notesService";

export default function HomeScreen() {
  const { mode } = useTheme();
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  const firstName = user?.email?.split("@")[0] || "there";

  useEffect(() => {
    const loadNotes = async () => {
      const notes = await notesService.getNotes();
      setRecentNotes(notes.slice(0, 3));
    };
    loadNotes();
  }, []);

  const handleQuickStart = async () => {
    if (recentNotes.length > 0) {
      router.push({
        pathname: "/(auth)/(features)/note-editor",
        params: { noteId: recentNotes[0].id },
      });
    } else {
      const newNote = await notesService.createNote({ title: "Quick Note" });
      if (newNote) {
        router.push({
          pathname: "/(auth)/(features)/note-editor",
          params: { noteId: newNote.id },
        });
      }
    }
  };

  const handleNewNote = async () => {
    const newNote = await notesService.createNote({ title: "New Note" });
    if (newNote) {
      router.push({
        pathname: "/(auth)/(features)/note-editor",
        params: { noteId: newNote.id },
      });
    }
  };

  const colors = Colors[mode];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeTitle}>
          Good afternoon, {firstName}.
        </ThemedText>
        <ThemedText style={[styles.welcomeSubtitle, { color: colors.secondary }]}>
          Ready to continue your work?
        </ThemedText>
      </View>

      {/* Quick Start Card */}
      <TouchableOpacity
        style={[
          styles.quickStartCard,
          {
            backgroundColor: colors.cardBackground || colors.background,
            borderColor: colors.cardBorder || colors.borderColor,
          },
        ]}
        onPress={handleQuickStart}
        activeOpacity={0.7}
      >
        <View style={styles.quickStartContent}>
          <ThemedText style={styles.quickStartTitle}>
            {recentNotes.length > 0
              ? `Resume "${recentNotes[0]?.title}"`
              : "Start writing"}
          </ThemedText>
          <ThemedText style={[styles.quickStartSubtitle, { color: colors.secondary }]}>
            {recentNotes.length > 0
              ? `Last edited ${new Date(recentNotes[0]?.updated_at).toLocaleDateString()}`
              : "Create your first note to get started."}
          </ThemedText>
        </View>
        <View
          style={[
            styles.quickStartButton,
            { backgroundColor: colors.accent || "#FFBF00" },
          ]}
        >
          <ThemedText style={[styles.quickStartButtonText, { color: colors.primary }]}>
            {recentNotes.length > 0 ? "Continue" : "Create"}
          </ThemedText>
        </View>
      </TouchableOpacity>

      {/* Tools Grid */}
      <View style={styles.toolsGrid}>
        {/* Notes */}
        <TouchableOpacity
          style={[
            styles.toolCard,
            {
              backgroundColor: colors.cardBackground || colors.background,
              borderColor: colors.cardBorder || colors.borderColor,
            },
          ]}
          onPress={() => router.push("/(auth)/(features)/notes" as Href)}
          activeOpacity={0.7}
        >
          <View style={[styles.toolIcon, { backgroundColor: mode === "light" ? "#F5F5F0" : "#3D566E" }]}>
            <StickyNote size={20} color={colors.text} />
          </View>
          <ThemedText style={styles.toolTitle}>Notes</ThemedText>
          <ThemedText style={[styles.toolDescription, { color: colors.secondary }]}>
            View all notes
          </ThemedText>
        </TouchableOpacity>

        {/* New Note */}
        <TouchableOpacity
          style={[
            styles.toolCard,
            {
              backgroundColor: colors.cardBackground || colors.background,
              borderColor: colors.cardBorder || colors.borderColor,
            },
          ]}
          onPress={handleNewNote}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.toolIcon,
              { backgroundColor: mode === "light" ? "rgba(255, 191, 0, 0.2)" : "rgba(255, 191, 0, 0.15)" },
            ]}
          >
            <PenTool size={20} color={colors.accent || "#FFBF00"} />
          </View>
          <ThemedText style={styles.toolTitle}>Read & Write</ThemedText>
          <ThemedText style={[styles.toolDescription, { color: colors.secondary }]}>
            New document
          </ThemedText>
        </TouchableOpacity>

        {/* Mindmap */}
        <TouchableOpacity
          style={[
            styles.toolCard,
            {
              backgroundColor: colors.cardBackground || colors.background,
              borderColor: colors.cardBorder || colors.borderColor,
            },
          ]}
          onPress={() => router.push("/(auth)/(features)/notes" as Href)}
          activeOpacity={0.7}
        >
          <View style={[styles.toolIcon, { backgroundColor: mode === "light" ? "#F5F5F0" : "#3D566E" }]}>
            <Grid3X3 size={20} color={colors.text} />
          </View>
          <ThemedText style={styles.toolTitle}>Mindmap</ThemedText>
          <ThemedText style={[styles.toolDescription, { color: colors.secondary }]}>
            Knowledge graph
          </ThemedText>
        </TouchableOpacity>

        {/* Research */}
        <TouchableOpacity
          style={[
            styles.toolCard,
            {
              backgroundColor: colors.cardBackground || colors.background,
              borderColor: colors.cardBorder || colors.borderColor,
            },
          ]}
          onPress={() => router.push("/(auth)/(features)/notes" as Href)}
          activeOpacity={0.7}
        >
          <View style={[styles.toolIcon, { backgroundColor: mode === "light" ? "#F5F5F0" : "#3D566E" }]}>
            <Search size={20} color={colors.text} />
          </View>
          <ThemedText style={styles.toolTitle}>Research</ThemedText>
          <ThemedText style={[styles.toolDescription, { color: colors.secondary }]}>
            Web capture
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Recent Notes Section */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Recent Notes</ThemedText>
          <TouchableOpacity onPress={() => router.push("/(auth)/(features)/notes" as Href)}>
            <ThemedText style={[styles.seeAllText, { color: colors.secondary }]}>
              See all
            </ThemedText>
          </TouchableOpacity>
        </View>

        {recentNotes.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.cardBackground || colors.background,
                borderColor: colors.cardBorder || colors.borderColor,
              },
            ]}
          >
            <ThemedText style={[styles.emptyText, { color: colors.secondary }]}>
              No notes yet. Create your first note to get started.
            </ThemedText>
          </View>
        ) : (
          recentNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[
                styles.recentCard,
                {
                  backgroundColor: colors.cardBackground || colors.background,
                  borderColor: colors.cardBorder || colors.borderColor,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/(auth)/(features)/note-editor",
                  params: { noteId: note.id },
                })
              }
              activeOpacity={0.7}
            >
              <View style={[styles.recentIcon, { backgroundColor: mode === "light" ? "#F5F5F0" : "#3D566E" }]}>
                <FileText size={18} color={colors.secondary} />
              </View>
              <View style={styles.recentContent}>
                <ThemedText style={styles.recentTitle} numberOfLines={1}>
                  {note.title}
                </ThemedText>
                <ThemedText style={[styles.recentDate, { color: colors.secondary }]}>
                  {new Date(note.updated_at).toLocaleDateString()}
                </ThemedText>
              </View>
              <ChevronRight size={18} color={colors.secondary} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
  },
  quickStartCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStartContent: {
    marginBottom: 16,
  },
  quickStartTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  quickStartSubtitle: {
    fontSize: 14,
  },
  quickStartButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  quickStartButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 24,
  },
  toolCard: {
    width: "47%",
    marginHorizontal: "1.5%",
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  toolDescription: {
    fontSize: 13,
  },
  recentSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 14,
  },
  emptyState: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 13,
  },
});
