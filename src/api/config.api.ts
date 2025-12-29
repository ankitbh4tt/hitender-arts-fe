export const ConfigApi = {
  fetchConfig: async (): Promise<any> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      tattooSizes: [
        { id: 1, label: "SMALL" },
        { id: 2, label: "MEDIUM" },
        { id: 3, label: "LARGE" },
      ],
      referenceTypes: [
        { id: 1, label: "INSTAGRAM" },
        { id: 2, label: "GOOGLE" },
      ],
      appointmentStatuses: [
        { id: 1, label: "SCHEDULED" },
        { id: 2, label: "CANCELLED" },
      ],
      labels: {
        welcome: "Welcome to HitenderArts Studio",
      },
    };
  },
};
