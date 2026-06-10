import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
  Pressable,
} from "react-native";
import { COLORS, SPACING, RADIUS, ANIM, SHADOWS } from "../constants/theme";
import { Typography } from "./Typography";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
  /** "light" sits on a page (default); "onDark" sits on a dark header. */
  tone?: "light" | "onDark";
}

const TRACK_PAD = 4;

export const SegmentedControl = ({
  segments,
  value,
  onChange,
  style,
  tone = "light",
}: SegmentedControlProps) => {
  const reduceMotion = useReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const count = segments.length || 1;
  const segWidth = trackWidth > 0 ? (trackWidth - TRACK_PAD * 2) / count : 0;
  const activeIndex = Math.max(0, segments.findIndex((s) => s.key === value));

  useEffect(() => {
    const target = activeIndex * segWidth;
    if (reduceMotion) {
      translateX.setValue(target);
      return;
    }
    Animated.spring(translateX, {
      toValue: target,
      useNativeDriver: true,
      damping: ANIM.spring.damping,
      stiffness: ANIM.spring.stiffness,
      mass: ANIM.spring.mass,
    }).start();
  }, [activeIndex, segWidth, reduceMotion]);

  const onLayout = (e: LayoutChangeEvent) =>
    setTrackWidth(e.nativeEvent.layout.width);

  const onDark = tone === "onDark";

  return (
    <View
      style={[styles.track, onDark ? styles.trackDark : styles.trackLight, style]}
      onLayout={onLayout}
    >
      {segWidth > 0 && (
        <Animated.View
          style={[
            styles.thumb,
            SHADOWS.light,
            {
              width: segWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      {segments.map((seg) => {
        const active = seg.key === value;
        return (
          <Pressable
            key={seg.key}
            style={styles.segment}
            onPress={() => onChange(seg.key)}
            accessibilityRole="tab"
            accessibilityLabel={seg.label}
            accessibilityState={{ selected: active }}
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Typography
              variant="label"
              color={
                active
                  ? COLORS.primary
                  : onDark
                  ? "rgba(255,255,255,0.7)"
                  : COLORS.textLight
              }
              weight={active ? "bold" : "medium"}
              numberOfLines={1}
            >
              {seg.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: RADIUS.pill,
    padding: TRACK_PAD,
    position: "relative",
  },
  trackLight: { backgroundColor: COLORS.backgroundAlt },
  trackDark: { backgroundColor: "rgba(255,255,255,0.12)" },
  thumb: {
    position: "absolute",
    top: TRACK_PAD,
    left: TRACK_PAD,
    bottom: TRACK_PAD,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.small + 2,
    zIndex: 1,
  },
});
