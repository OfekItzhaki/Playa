import { Modal as RNModal, View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-gray-900">{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Text className="text-2xl text-gray-600">×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="p-4">{children}</ScrollView>
        </View>
      </View>
    </RNModal>
  );
}
