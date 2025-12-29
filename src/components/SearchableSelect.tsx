import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput as RNTextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";
import { Typography } from "./Typography";
import { Input } from "./Input";

interface Option {
  id: number | string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  value?: Option | null;
  options: Option[];
  onSelect: (option: Option) => void;
  placeholder?: string;
  error?: string;
}

export const SearchableSelect = ({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option",
  error,
}: SearchableSelectProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    onSelect(option);
    setModalVisible(false);
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      )}

      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Typography
          variant="body"
          color={value ? COLORS.text : COLORS.textLight}
        >
          {value ? value.label : placeholder}
        </Typography>
        <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      {error && (
        <Typography
          variant="caption"
          color={COLORS.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3">{label || "Select"}</Typography>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={COLORS.textLight}
                style={styles.searchIcon}
              />
              <RNTextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value?.id === item.id ? styles.optionSelected : null,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Typography
                    variant="body"
                    color={
                      value?.id === item.id ? COLORS.secondary : COLORS.text
                    }
                  >
                    {item.label}
                  </Typography>
                  {value?.id === item.id && (
                    <Ionicons
                      name="checkmark"
                      size={24}
                      color={COLORS.secondary}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Typography variant="body" color={COLORS.textLight}>
                    No options found
                  </Typography>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.medium,
  },
  label: {
    marginBottom: SPACING.tiny,
  },
  trigger: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  triggerError: {
    borderColor: COLORS.error,
  },
  errorText: {
    marginTop: SPACING.tiny,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    margin: SPACING.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.medium,
  },
  searchIcon: {
    marginRight: SPACING.small,
  },
  searchInput: {
    flex: 1,
    padding: SPACING.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionSelected: {
    backgroundColor: COLORS.card,
  },
  emptyState: {
    padding: SPACING.xlarge,
    alignItems: "center",
  },
});
