import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, StyleProp, Easing } from "react-native";
import { ANIM } from "../constants/theme";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface FadeInViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Index in a list - multiplies the stagger delay for a cascading entrance. */
  index?: number;
  /** Extra delay (ms) on top of the staggered index delay. */
  delay?: number;
  /** Pixels to translate up from on entry (default 12). */
  offsetY?: number;
}

/**
 * Fades + lifts its children in on mount. Pass `index` inside a mapped list to
 * get a smooth staggered cascade. Native-driven, so it never janks. Respects the
 * OS "Reduce Motion" setting by appearing instantly with no movement.
 */
export const FadeInView = ({
  children,
  style,
  index = 0,
  delay = 0,
  offsetY = 12,
}: FadeInViewProps) => {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      // Appear immediately, no autonomous movement.
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: ANIM.base,
      delay: delay + index * ANIM.stagger,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reduceMotion]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offsetY, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
