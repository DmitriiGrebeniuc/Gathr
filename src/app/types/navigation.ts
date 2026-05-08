export type NavigationDirection = 'forward' | 'back' | 'up' | 'down';

export type ScreenName = string;

export type NavigationEntry = {
  screen: ScreenName;
  data?: any;
};

export type LoginContext = {
  backScreen: string;
  backData?: any;
} | null;
