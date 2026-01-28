import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import CleanersListScreen from './screens/CleanersListScreen';
import CleanerDetailScreen from './screens/CleanerDetailScreen';
import BookingScreen from './screens/BookingScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import PaymentScreen from './screens/PaymentScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReferralScreen from './screens/ReferralScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main Navigator
const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Cleaners') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Chat') {
          iconName = focused ? 'chatbubble' : 'chatbubble-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3B82F6',
      tabBarInactiveTintColor: '#999',
      headerShown: true,
      headerStyle: {
        backgroundColor: '#3B82F6',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen name="Home" component={DashboardScreen} options={{ title: '🏠 Home' }} />
    <Tab.Screen name="Cleaners" component={CleanersListScreen} options={{ title: '👩‍🔧 Faxineiras' }} />
    <Tab.Screen name="Chat" component={ChatScreen} options={{ title: '💬 Mensagens' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '👤 Perfil' }} />
  </Tab.Navigator>
);

// Root Navigator
export const RootNavigator = ({ isLoggedIn }) => (
  <NavigationContainer>
    {isLoggedIn ? (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="CleanerDetail" component={CleanerDetailScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Referral" component={ReferralScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    ) : (
      <AuthNavigator />
    )}
  </NavigationContainer>
);

export default RootNavigator;
