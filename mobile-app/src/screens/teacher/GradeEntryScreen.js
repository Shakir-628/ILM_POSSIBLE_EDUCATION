import React from 'react';
import { View, StyleSheet } from 'react-native';
import EmptyState from '../../components/EmptyState';

const GradeEntryScreen = () => {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="create-outline"
        title="Grade Entry"
        message="Grade entry feature coming soon"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
});

export default GradeEntryScreen;

