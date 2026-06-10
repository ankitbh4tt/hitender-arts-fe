import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { COLORS, SPACING } from "../constants/theme";

// Screens
import { DayCalendar } from "../screens/DayCalendar";
import { QuickAddAppointment } from "../screens/QuickAddAppointment";
import { ClientsList } from "../screens/ClientsList";
import { ClientDetail } from "../screens/ClientDetail";
import { Inquiry } from "../screens/Inquiry";
import { ScheduleAppointment } from "../screens/ScheduleAppointment";
import { RescheduleAppointment } from "../screens/RescheduleAppointment";
import { FollowUpsList } from "../screens/FollowUpsList";
import { Settings } from "../screens/Settings";

const Tab = createBottomTabNavigator();
const TodayStack = createNativeStackNavigator();
const ClientsStack = createNativeStackNavigator();
const FollowUpsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

// Today tab - the day calendar home + appointment creation/editing.
const TodayNavigator = () => (
  <TodayStack.Navigator screenOptions={{ headerShown: false }}>
    <TodayStack.Screen name="DayCalendar" component={DayCalendar} />
    <TodayStack.Screen name="QuickAddAppointment" component={QuickAddAppointment} />
    <TodayStack.Screen name="ScheduleAppointment" component={ScheduleAppointment} />
    <TodayStack.Screen name="RescheduleAppointment" component={RescheduleAppointment} />
  </TodayStack.Navigator>
);

// Clients tab - profiles, inquiries, and scheduling from a client.
const ClientsNavigator = () => (
  <ClientsStack.Navigator screenOptions={{ headerShown: false }}>
    <ClientsStack.Screen name="ClientsList" component={ClientsList} />
    <ClientsStack.Screen name="ClientDetail" component={ClientDetail} />
    <ClientsStack.Screen
      name="Inquiry"
      component={Inquiry}
      initialParams={{ client: null }}
    />
    <ClientsStack.Screen name="ScheduleAppointment" component={ScheduleAppointment} />
    <ClientsStack.Screen name="RescheduleAppointment" component={RescheduleAppointment} />
  </ClientsStack.Navigator>
);

const FollowUpsNavigator = () => (
  <FollowUpsStack.Navigator screenOptions={{ headerShown: false }}>
    <FollowUpsStack.Screen name="FollowUpsList" component={FollowUpsList} />
  </FollowUpsStack.Navigator>
);

const SettingsNavigator = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="Settings" component={Settings} />
  </SettingsStack.Navigator>
);

export const CRMTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondaryDark,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingTop: SPACING.small,
          paddingBottom: Platform.OS === "ios" ? SPACING.large : SPACING.small,
        },
      }}
    >
      <Tab.Screen
        name="TodayTab"
        component={TodayNavigator}
        options={{
          tabBarLabel: "Today",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          // Pressing the tab always returns to the day calendar.
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.navigate({
                name: "TodayTab",
                params: { screen: "DayCalendar" },
              })
            );
          },
        })}
      />
      <Tab.Screen
        name="ClientsTab"
        component={ClientsNavigator}
        options={{
          tabBarLabel: "Clients",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FollowUpsTab"
        component={FollowUpsNavigator}
        options={{
          tabBarLabel: "Follow-Ups",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
