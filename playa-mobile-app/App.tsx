import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <StatusBar style="auto" />
    </View>
  );
}
