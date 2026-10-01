import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import apiClient from '../api/apiClient';

export default function AdminMenuScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/food-items');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (error) {
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setDescription('');
    setCategory('Main Course');
    setStockQuantity('20');
    setImage('');
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(String(item.price));
    setDescription(item.description);
    setCategory(item.category || 'Main Course');
    setStockQuantity(String(item.stockQuantity || 20));
    setImage(item.image || '');
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!name || !price || !description) {
      Alert.alert('Validation Error', 'Please fill in Name, Price, and Description.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        price: Number(price),
        description,
        category,
        stockQuantity: Number(stockQuantity),
        image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      };

      if (editingItem) {
        // Update existing item (PUT /api/food-items/:id)
        const res = await apiClient.put(`/food-items/${editingItem._id}`, payload);
        if (res.data.success) {
          Alert.alert('Success', 'Menu item updated successfully!');
        }
      } else {
        // Create new item (POST /api/food-items)
        const res = await apiClient.post('/food-items', payload);
        if (res.data.success) {
          Alert.alert('Success', 'Menu item created successfully!');
        }
      }

      setModalVisible(false);
      fetchItems();
    } catch (error) {
      console.error('Save item error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = (id, itemName) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiClient.delete(`/food-items/${id}`);
              if (res.data.success) {
                Alert.alert('Deleted', 'Menu item deleted successfully.');
                fetchItems();
              }
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete item.');
            }
          },
        },
      ]
    );
  };

  const renderItemCard = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image?.startsWith('http') ? item.image : `http://localhost:5001${item.image}` }}
        style={styles.cardImg}
      />
      <View style={styles.cardDetails}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category} • Stock: {item.stockQuantity}</Text>
        <Text style={styles.cardPrice}>Rs. {Math.round(item.price)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
          <Text style={styles.editBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteItem(item._id, item.name)}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Item Admin ⚙️</Text>
        <TouchableOpacity style={styles.addMainBtn} onPress={openAddModal}>
          <Text style={styles.addMainBtnText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItemCard}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Item Name" placeholderTextColor="#777" />

              <Text style={styles.label}>Price (Rs.)</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="3500" keyboardType="numeric" placeholderTextColor="#777" />

              <Text style={styles.label}>Category</Text>
              <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Main Course, Starters, etc." placeholderTextColor="#777" />

              <Text style={styles.label}>Stock Quantity</Text>
              <TextInput style={styles.input} value={stockQuantity} onChangeText={setStockQuantity} placeholder="20" keyboardType="numeric" placeholderTextColor="#777" />

              <Text style={styles.label}>Image URL</Text>
              <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="https://..." placeholderTextColor="#777" />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, { height: 70 }]} value={description} onChangeText={setDescription} placeholder="Description..." multiline placeholderTextColor="#777" />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, submitting && styles.disabledBtn]} disabled={submitting} onPress={handleSaveItem}>
                <Text style={styles.saveBtnText}>{submitting ? 'Saving...' : 'Save Item'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', paddingTop: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  addMainBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addMainBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { flexDirection: 'row', backgroundColor: '#1C1C22', borderRadius: 14, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#282832' },
  cardImg: { width: 60, height: 60, borderRadius: 10 },
  cardDetails: { flex: 1, marginLeft: 12 },
  cardTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cardCategory: { color: '#888', fontSize: 12, marginTop: 2 },
  cardPrice: { color: '#00E676', fontWeight: 'bold', fontSize: 14, marginTop: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { backgroundColor: '#282832', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  editBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1C1C22', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#282832' },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { color: '#AAA', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#121214', color: '#FFF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginBottom: 12, fontSize: 14 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 10 },
  cancelBtnText: { color: '#AAA', fontWeight: '600' },
  saveBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  disabledBtn: { opacity: 0.6 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
});
