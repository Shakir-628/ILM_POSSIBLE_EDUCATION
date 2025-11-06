import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmptyState from '../../components/EmptyState';

const MarkAttendanceScreen = () => {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="checkmark-done-circle-outline"
        title="Mark Attendance"
        message="Attendance marking feature coming soon"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
});

export default MarkAttendanceScreen;

