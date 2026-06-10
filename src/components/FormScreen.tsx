import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  StyleProp,
  ViewStyle,
} from "react-native";
import { COLORS, SPACING, SCREEN, IS_IOS } from "../constants/theme";
import { Header } from "./Header";

interface FormScreenProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  /** Optional sticky footer (e.g. action buttons) pinned below the scroll area. */
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** "light" header blends into the page (default); "dark" for tab-root screens. */
  headerVariant?: "dark" | "light";
}

/**
 * Standard scrollable form layout: a light premium header with a back button,
 * keyboard-avoiding scroll area, and content width-capped + centered on tablets.
 */
export const FormScreen = ({
  title,
  subtitle,
  onBack,
  children,
  footer,
  contentStyle,
  headerVariant = "light",
}: FormScreenProps) => {
  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={headerVariant === "dark" ? "light-content" : "dark-content"}
        backgroundColor={headerVariant === "dark" ? COLORS.primary : COLORS.background}
      />
      <Header variant={headerVariant} title={title} subtitle={subtitle} onBack={onBack} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={IS_IOS ? "padding" : undefined}
        keyboardVerticalOffset={IS_IOS ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.inner, contentStyle]}>{children}</View>
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: {
    paddingTop: SPACING.medium,
    paddingBottom: SPACING.xxlarge,
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: SCREEN.maxContentWidth,
    paddingHorizontal: SPACING.large,
  },
  footer: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.small,
    paddingBottom: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
  },
});
