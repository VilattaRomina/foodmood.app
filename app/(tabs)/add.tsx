import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/list');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirigiendo...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
  },
});