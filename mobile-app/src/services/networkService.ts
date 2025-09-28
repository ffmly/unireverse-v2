import NetInfo from '@react-native-community/netinfo';

export class NetworkService {
  static async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable === true;
    } catch (error) {
      console.warn('Network check failed:', error);
      return false;
    }
  }

  static async isWifiConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && 
             state.type === 'wifi' && 
             state.isInternetReachable === true;
    } catch (error) {
      console.warn('WiFi check failed:', error);
      return false;
    }
  }

  static addConnectionListener(callback: (isConnected: boolean) => void) {
    return NetInfo.addEventListener(state => {
      const isConnected = state.isConnected === true && state.isInternetReachable === true;
      callback(isConnected);
    });
  }

  static addWifiListener(callback: (isWifiConnected: boolean) => void) {
    return NetInfo.addEventListener(state => {
      const isWifiConnected = state.isConnected === true && 
                             state.type === 'wifi' && 
                             state.isInternetReachable === true;
      callback(isWifiConnected);
    });
  }
}
