export type NavigationDirection = 'forward' | 'back' | 'up' | 'down' | 'fade';

export type ScreenName = string;

export type NavigationEntry = {
  screen: ScreenName;
  data?: any;
};

export type LoginContext = {
  backScreen: string;
  backData?: any;
} | null;
