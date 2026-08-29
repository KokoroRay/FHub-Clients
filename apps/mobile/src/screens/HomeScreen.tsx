import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FHub Mobile App</Text>
      <Text style={styles.subtitle}>React Native + TypeScript</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => alert('Nút bấm hoạt động bình thường!')}
      >
        <Text style={styles.buttonText}>Bắt đầu khám phá</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});