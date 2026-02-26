import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';

interface MessagePoolEditorProps {
  messages: string[];
  onChange: (messages: string[]) => void;
  maxMessages?: number;
  maxLength?: number;
  error?: string;
}

export default function MessagePoolEditor({
  messages,
  onChange,
  maxMessages = 100,
  maxLength = 500,
  error,
}: MessagePoolEditorProps) {
  const [newMessage, setNewMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddMessage = () => {
    if (newMessage.trim() && messages.length < maxMessages) {
      onChange([...messages, newMessage.trim()]);
      setNewMessage('');
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(messages[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingText.trim()) {
      const updated = [...messages];
      updated[editingIndex] = editingText.trim();
      onChange(updated);
      setEditingIndex(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleDeleteMessage = (index: number) => {
    onChange(messages.filter((_, i) => i !== index));
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-medium text-gray-700">
          Message Templates
        </Text>
        <Text className="text-sm text-gray-500">
          {messages.length}/{maxMessages}
        </Text>
      </View>

      {/* Add New Message */}
      <View className="mb-4">
        <View className="flex-row items-start">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 mr-2"
            placeholder="Add a message template..."
            value={newMessage}
            onChangeText={setNewMessage}
            maxLength={maxLength}
            multiline
            accessibilityLabel="New message template"
          />
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              newMessage.trim() && messages.length < maxMessages
                ? 'bg-blue-500'
                : 'bg-gray-300'
            }`}
            onPress={handleAddMessage}
            disabled={!newMessage.trim() || messages.length >= maxMessages}
            accessibilityLabel="Add message"
          >
            <Text className="text-white font-medium">Add</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-500 mt-1">
          {newMessage.length}/{maxLength} characters
        </Text>
      </View>

      {/* Message List */}
      {messages.length > 0 && (
        <View className="border border-gray-200 rounded-lg">
          <FlatList
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View
                className={`p-3 ${
                  index < messages.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                {editingIndex === index ? (
                  // Edit Mode
                  <View>
                    <TextInput
                      className="border border-blue-500 rounded-lg px-3 py-2 mb-2"
                      value={editingText}
                      onChangeText={setEditingText}
                      maxLength={maxLength}
                      multiline
                      autoFocus
                      accessibilityLabel={`Edit message ${index + 1}`}
                    />
                    <View className="flex-row justify-end space-x-2">
                      <TouchableOpacity
                        className="px-3 py-1 bg-gray-200 rounded"
                        onPress={handleCancelEdit}
                      >
                        <Text className="text-gray-700">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="px-3 py-1 bg-blue-500 rounded"
                        onPress={handleSaveEdit}
                      >
                        <Text className="text-white">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // View Mode
                  <View className="flex-row justify-between items-start">
                    <Text className="flex-1 text-gray-800">{item}</Text>
                    <View className="flex-row ml-2">
                      <TouchableOpacity
                        className="px-2 py-1"
                        onPress={() => handleStartEdit(index)}
                        accessibilityLabel={`Edit message ${index + 1}`}
                      >
                        <Text className="text-blue-600">Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="px-2 py-1"
                        onPress={() => handleDeleteMessage(index)}
                        accessibilityLabel={`Delete message ${index + 1}`}
                      >
                        <Text className="text-red-600">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      )}

      {error && (
        <Text className="text-sm text-red-600 mt-2" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}
