import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './Navigation';
import { useAuthStore } from '../frontend/src/stores/authStore';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { token, validateToken } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Validar token se existente
        if (token) {
          await validateToken();
        }
      } catch (error) {
        console.error('Erro ao validar token:', error);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <RootNavigator isLoggedIn={!!token} />
    </SafeAreaProvider>
  );
}
