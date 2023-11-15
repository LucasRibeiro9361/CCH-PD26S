import React from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';

const Loading = ({ isLoading }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isLoading}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    </Modal>
  );
};

export default Loading;