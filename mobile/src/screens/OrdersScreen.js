import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

const STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function OrdersScreen() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchOrders();
  }, []);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#10B981';
      case 'Preparing':
        return '#E53935';
      case 'Out for Delivery':
        return '#0EA5E9';
      case 'Cancelled':
        return '#EF4444';
      default:
        return '#E53935';
    }
  };

  const renderOrderCard = ({ item }) => {
    const isTerminalStatus = item.orderStatus === 'Delivered' || item.orderStatus === 'Cancelled';

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order #{String(item._id).slice(-6)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.orderStatus)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus) }]}>
              {item.orderStatus}
            </Text>
          </View>
        </View>

        {isAdmin && item.userId && (
          <Text style={styles.customerText}>Customer: {item.userId.name} ({item.userId.email})</Text>
        )}

        <Text style={styles.dateText}>
          Placed on {new Date(item.createdAt).toLocaleDateString()} at{' '}
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        <View style={styles.divider} />

        {item.items.map((sub, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {sub.quantity}x {sub.foodItemId?.name || 'Food Item'}
            </Text>
            <Text style={styles.itemPrice}>Rs. {Math.round(sub.price * sub.quantity)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>Rs. {Math.round(item.totalAmount)}</Text>
        </View>

        {/* Admin Status Controls */}
        {isAdmin && !isTerminalStatus && (
          <View style={styles.adminControls}>
            <Text style={styles.adminControlLabel}>Change Status:</Text>
            <View style={styles.statusButtonsRow}>
              {STATUSES.filter((s) => s !== item.orderStatus).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={styles.statusBtn}
                  onPress={() => handleUpdateStatus(item._id, st)}
                >
                  <Text style={styles.statusBtnText}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isAdmin ? 'All Orders (Admin)' : 'My Orders'} 📦</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
          <Text style={styles.refreshText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  refreshBtn: {
    padding: 6,
  },
  refreshText: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    elevation: 3,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  customerText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  dateText: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    color: '#374151',
    fontSize: 13,
  },
  itemPrice: {
    color: '#6B7280',
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  totalPrice: {
    color: '#E53935',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminControls: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  adminControlLabel: {
    color: '#6B7280',
    fontSize: 11,
    marginBottom: 8,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBtnText: {
    color: '#1F2937',
    fontSize: 11,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 15,
  },
});
