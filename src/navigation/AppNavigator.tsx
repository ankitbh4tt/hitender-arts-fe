import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { CRMTabs } from "./CRMTabs";

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <CRMTabs />
    </NavigationContainer>
  );
};
