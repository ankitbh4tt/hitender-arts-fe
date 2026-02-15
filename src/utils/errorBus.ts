type Listener = (message: string) => void;

let listeners: Listener[] = [];

export const errorBus = {
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  emit(message: string) {
    listeners.forEach(listener => listener(message));
  }
};
