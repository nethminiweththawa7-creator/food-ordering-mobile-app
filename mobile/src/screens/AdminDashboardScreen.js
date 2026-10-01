import React, { useState, useEffect, useContext } from 'react';
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
  Platform,
} from 'react-native';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders' | 'stats'

  // Menu items state
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
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

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchOrders();
  }, []);

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const res = await apiClient.get('/food-items');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (error) {
      console.error('Fetch items error:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await apiClient.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
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
    if (!name.trim() || !price || !description.trim()) {
      showAlert('Validation Error', 'Please fill in Name, Price, and Description.');
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
        const res = await apiClient.put(`/food-items/${editingItem._id}`, payload);
        if (res.data.success) {
          showAlert('Success', 'Menu item updated successfully!');
        }
      } else {
        const res = await apiClient.post('/food-items', payload);
        if (res.data.success) {
          showAlert('Success', 'Menu item created successfully!');
        }
      }

      setModalVisible(false);
      fetchItems();
    } catch (error) {
      console.error('Save item error:', error);
      showAlert('Error', error.response?.data?.message || 'Failed to save menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = (id, itemName) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
        deleteItemApi(id);
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete "${itemName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteItemApi(id) },
        ]
      );
    }
  };

  const deleteItemApi = async (id) => {
    try {
      const res = await apiClient.delete(`/food-items/${id}`);
      if (res.data.success) {
        showAlert('Deleted', 'Menu item deleted successfully.');
        fetchItems();
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await apiClient.patch(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });
      if (res.data.success) {
        showAlert('Status Updated', `Order status changed to '${newStatus}'`);
        fetchOrders();
      }
    } catch (error) {
      showAlert('Update Failed', error.response?.data?.message || 'Failed to update order status');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const renderItemCard = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image?.startsWith('http') ? item.image : `http://localhost:5001${item.image}` }}
        style={styles.cardImg}
        resizeMode="cover"
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

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{String(item._id).slice(-6)}</Text>
        <Text style={styles.orderStatusBadge}>{item.orderStatus}</Text>
      </View>
      <Text style={styles.orderCustomer}>
        Customer: {item.userId?.name || 'User'} ({item.userId?.email || 'N/A'})
      </Text>
      <Text style={styles.orderAddress}>Address: {item.deliveryAddress}</Text>
      <Text style={styles.orderTotal}>Total: Rs. {Math.round(item.totalAmount)}</Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Set Status:</Text>
        {['Pending', 'Preparing', 'Completed', 'Cancelled'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.statusChip, item.orderStatus === st && styles.statusChipActive]}
            onPress={() => handleUpdateOrderStatus(item._id, st)}
          >
            <Text style={styles.statusChipText}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Control Panel ⚙️</Text>
          <Text style={styles.headerSub}>Logged in as {user?.name || 'Administrator'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'menu' && styles.tabBtnActive]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'menu' && styles.tabBtnTextActive]}>
            🍔 Menu CRUD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'orders' && styles.tabBtnTextActive]}>
            📦 Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'stats' && styles.tabBtnActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'stats' && styles.tabBtnTextActive]}>
            📊 Overview
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Contents */}
      {activeTab === 'menu' && (
        <View style={{ flex: 1 }}>
          <View style={styles.actionBar}>
            <Text style={styles.sectionTitle}>Menu Items ({items.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
              <Text style={styles.addBtnText}>+ Create Item</Text>
            </TouchableOpacity>
          </View>

          {loadingItems ? (
            <ActivityIndicator size="large" color="#E53935" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item._id}
              renderItem={renderItemCard}
              contentContainerStyle={styles.listPadding}
            />
          )}
        </View>
      )}

      {activeTab === 'orders' && (
        <View style={{ flex: 1 }}>
          <View style={styles.actionBar}>
            <Text style={styles.sectionTitle}>Customer Orders ({orders.length})</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
              <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>

          {loadingOrders ? (
            <ActivityIndicator size="large" color="#E53935" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item._id}
              renderItem={renderOrderCard}
              contentContainerStyle={styles.listPadding}
            />
          )}
        </View>
      )}

      {activeTab === 'stats' && (
        <ScrollView style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Menu Items</Text>
            <Text style={styles.statValue}>{items.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Orders Placed</Text>
            <Text style={styles.statValue}>{orders.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total System Revenue</Text>
            <Text style={[styles.statValue, { color: '#E53935' }]}>Rs. {Math.round(totalRevenue)}</Text>
          </View>
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
            </Text>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Deluxe Cheeseburger" placeholderTextColor="#94A3B8" />

              <Text style={styles.inputLabel}>Price (Rs.)</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="3500" keyboardType="numeric" placeholderTextColor="#94A3B8" />

              <Text style={styles.inputLabel}>Category</Text>
              <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Main Course / Starters / Desserts" placeholderTextColor="#94A3B8" />

              <Text style={styles.inputLabel}>Stock Quantity</Text>
              <TextInput style={styles.input} value={stockQuantity} onChangeText={setStockQuantity} placeholder="20" keyboardType="numeric" placeholderTextColor="#94A3B8" />

              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="https://images.unsplash.com/..." placeholderTextColor="#94A3B8" />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={[styles.input, { height: 70 }]} value={description} onChangeText={setDescription} placeholder="Description..." multiline placeholderTextColor="#94A3B8" />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, submitting && { opacity: 0.6 }]} disabled={submitting} onPress={handleSaveItem}>
                <Text style={styles.modalSaveText}>{submitting ? 'Saving...' : 'Save Item'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 0 },
  header: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 48, paddingBottom: 18 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: '#FFEBEE', marginTop: 2, fontWeight: '600' },
  logoutBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  logoutBtnText: { color: '#E53935', fontWeight: 'bold', fontSize: 13 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 16, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#FFFFFF', borderRadius: 12, marginRight: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
  tabBtnActive: { backgroundColor: '#E53935', borderColor: '#E53935' },
  tabBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
  tabBtnTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  actionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  addBtn: { backgroundColor: '#E53935', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  refreshBtn: { padding: 6 },
  refreshBtnText: { color: '#E53935', fontWeight: 'bold', fontSize: 13 },
  listPadding: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#FEE2E2', elevation: 3 },
  cardImg: { width: 64, height: 64, borderRadius: 10 },
  cardDetails: { flex: 1, marginLeft: 12 },
  cardTitle: { color: '#1F2937', fontWeight: 'bold', fontSize: 15 },
  cardCategory: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  cardPrice: { color: '#E53935', fontWeight: 'bold', fontSize: 14, marginTop: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { backgroundColor: '#1F2937', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  editBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 16 },
  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1.5, borderColor: '#FEE2E2', elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderId: { color: '#1F2937', fontWeight: 'bold', fontSize: 15 },
  orderStatusBadge: { color: '#E53935', fontWeight: 'bold', fontSize: 12 },
  orderCustomer: { color: '#4B5563', fontSize: 13, marginBottom: 4 },
  orderAddress: { color: '#6B7280', fontSize: 12, marginBottom: 6 },
  orderTotal: { color: '#E53935', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  statusLabel: { color: '#6B7280', fontSize: 11, marginRight: 4 },
  statusChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusChipActive: { backgroundColor: '#E53935' },
  statusChipText: { color: '#1F2937', fontSize: 11, fontWeight: '600' },
  statsContainer: { paddingHorizontal: 20 },
  statCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 14, borderWidth: 1.5, borderColor: '#FEE2E2', elevation: 3 },
  statLabel: { color: '#6B7280', fontSize: 14, marginBottom: 6 },
  statValue: { color: '#1F2937', fontSize: 28, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(31,41,55,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#FEE2E2' },
  modalTitle: { color: '#1F2937', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  inputLabel: { color: '#374151', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#F9FAFB', color: '#1F2937', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 10 },
  modalCancelText: { color: '#6B7280', fontWeight: '600' },
  modalSaveBtn: { backgroundColor: '#E53935', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  modalSaveText: { color: '#FFFFFF', fontWeight: 'bold' },
});
