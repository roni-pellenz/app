import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View
} from "react-native";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type PasswordInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggleVisibility: () => void;
  disabled?: boolean;
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
};

export function PasswordInput({
  value,
  onChangeText,
  placeholder,
  visible,
  onToggleVisibility,
  disabled = false,
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing
}: PasswordInputProps) {
  const { theme, resolvedThemeMode } = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const maskScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible || value.length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      maskScrollRef.current?.scrollToEnd({
        animated: false
      });
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [value.length, visible]);

  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />

      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          editable={!disabled}
          caretHidden={!visible}
          keyboardAppearance={resolvedThemeMode}
          selectionColor={visible ? theme.colors.primary : "transparent"}
          onSubmitEditing={onSubmitEditing}
          style={[styles.input, !visible && value.length > 0 && styles.maskedInput]}
        />

        {!visible && value.length > 0 ? (
          <View pointerEvents="none" style={styles.maskOverlay}>
            <ScrollView
              ref={maskScrollRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              style={styles.maskScroll}
              contentContainerStyle={styles.maskContent}
            >
              {Array.from({
                length: value.length
              }).map((_, index) => (
                <Ionicons key={index} name="lock-closed" size={9} color={theme.colors.text} />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <Pressable
        disabled={disabled}
        onPress={onToggleVisibility}
        hitSlop={10}
        style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
      >
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={21}
          color={theme.colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      paddingLeft: 14,
      paddingRight: 8,
      backgroundColor: theme.colors.surfaceMuted
    },

    inputWrapper: {
      position: "relative",
      flex: 1,
      height: "100%",
      justifyContent: "center",
      overflow: "hidden"
    },

    input: {
      width: "100%",
      height: "100%",
      paddingVertical: 0,
      paddingHorizontal: 0,
      fontSize: 15,
      color: theme.colors.text
    },

    maskedInput: {
      color: "transparent"
    },

    maskOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: "center",
      overflow: "hidden"
    },

    maskScroll: {
      flexGrow: 0
    },

    maskContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingRight: 3
    },

    eyeButton: {
      width: 30,
      height: 40,
      alignItems: "center",
      justifyContent: "center"
    },

    pressed: {
      opacity: 0.55
    }
  });
}
