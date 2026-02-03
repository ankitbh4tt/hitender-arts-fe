import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CRMTabs } from "./CRMTabs";
import { MobileNumberEntry } from "../screens/MobileNumberEntry";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="CRMRoot"
      >
        <Stack.Screen name="MobileNumberEntry" component={MobileNumberEntry} />
        <Stack.Screen name="CRMRoot" component={CRMTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
