import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  PressableProps,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from "react-native";
import { ANIM, HIT_SLOP } from "../constants/theme";

interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale to animate to while pressed (default 0.97). */
  scaleTo?: number;
  disabled?: boolean;
}

/**
 * A press target that springs down slightly while held - the tactile feedback
 * used across buttons, cards and the FAB. Runs on the native driver so it stays
 * smooth even while JS is busy.
 */
export const PressableScale = ({
  children,
  style,
  scaleTo = ANIM.pressScale,
  disabled,
  onPressIn,
  onPressOut,
  hitSlop,
  ...rest
}: PressableScaleProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      damping: ANIM.spring.damping,
      stiffness: ANIM.spring.stiffness,
      mass: ANIM.spring.mass,
    }).start();

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) animateTo(scaleTo);
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    animateTo(1);
    onPressOut?.(e);
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop ?? HIT_SLOP}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
