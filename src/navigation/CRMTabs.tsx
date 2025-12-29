import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

// Import screens
import { ClientsList } from "../screens/ClientsList";
import { ClientDetail } from "../screens/ClientDetail";
import { InquiriesList } from "../screens/InquiriesList";
import { Inquiry } from "../screens/Inquiry";
import { AppointmentsList } from "../screens/AppointmentsList";
import { ScheduleAppointment } from "../screens/ScheduleAppointment";
import { RescheduleAppointment } from "../screens/RescheduleAppointment";

const Tab = createBottomTabNavigator();
const ClientsStack = createNativeStackNavigator();
const InquiriesStack = createNativeStackNavigator();
const AppointmentsStack = createNativeStackNavigator();

// Clients Tab Stack
const ClientsNavigator = () => (
  <ClientsStack.Navigator screenOptions={{ headerShown: false }}>
    <ClientsStack.Screen name="ClientsList" component={ClientsList} />
    <ClientsStack.Screen name="ClientDetail" component={ClientDetail} />
  </ClientsStack.Navigator>
);

// Inquiries Tab Stack
const InquiriesNavigator = () => (
  <InquiriesStack.Navigator screenOptions={{ headerShown: false }}>
    <InquiriesStack.Screen name="InquiriesList" component={InquiriesList} />
    <InquiriesStack.Screen name="Inquiry" component={Inquiry} />
  </InquiriesStack.Navigator>
);

// Appointments Tab Stack
const AppointmentsNavigator = () => (
  <AppointmentsStack.Navigator screenOptions={{ headerShown: false }}>
    <AppointmentsStack.Screen
      name="AppointmentsList"
      component={AppointmentsList}
    />
    <AppointmentsStack.Screen
      name="ScheduleAppointment"
      component={ScheduleAppointment}
    />
    <AppointmentsStack.Screen
      name="RescheduleAppointment"
      component={RescheduleAppointment}
    />
  </AppointmentsStack.Navigator>
);

// Bottom Tab Navigator
export const CRMTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
        },
      }}
    >
      <Tab.Screen
        name="ClientsTab"
        component={ClientsNavigator}
        options={{
          tabBarLabel: "Clients",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="InquiriesTab"
        component={InquiriesNavigator}
        options={{
          tabBarLabel: "Inquiries",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AppointmentsTab"
        component={AppointmentsNavigator}
        options={{
          tabBarLabel: "Appointments",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
