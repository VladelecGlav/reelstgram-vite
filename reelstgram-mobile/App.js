import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigationnative';
import { createStackNavigator } from '@react-navigationstack';
import WelcomeScreen from '.screensWelcomeScreen';
import ContentViewerScreen from '.screensContentViewerScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    NavigationContainer
      Stack.Navigator initialRouteName=Welcome
        Stack.Screen name=Welcome component={WelcomeScreen} options={{ headerShown false }} 
        Stack.Screen name=ContentViewer component={ContentViewerScreen} options={{ headerShown false }} 
      Stack.Navigator
      StatusBar style=light 
    NavigationContainer
  );
}

const styles = StyleSheet.create({
  container {
    flex 1,
    backgroundColor '#000',
  },
});