import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Colors, Typography } from "../../constants/Colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  marginBottom?: boolean;
  containerStyles?: object;
}

export default function Input({
  label,
  error,
  hint,
  style,
  marginBottom,
  containerStyles,
  ...props
}: InputProps) {
  return (
    <View
      style={[
        styles.container,
        { marginBottom: marginBottom ? 0 : 16 },
        containerStyles,
      ]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={Colors.gray400}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginBottom: marginBottom?0: 16,
    // width: "100%",
    // flex: 1,
  },
  label: {
    ...Typography.bodySemiBold,
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  hint: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: 4,
  },
});
