import { DataStore } from "../data/store";

export const InquiriesApi = {
  createInquiry: (data: any) => {
    return DataStore.createInquiry(data);
  },
};
