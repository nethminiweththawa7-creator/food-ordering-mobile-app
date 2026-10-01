import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export default function CartScreen({ navigation }) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main Street, City');
  const [submitting, setSubmitting] = useState(false);

  const DELIVERY_FEE = 350;
  const subtotal = getCartTotal();
  const grandTotal = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      showAlert('Authentication Required', 'Please login to place an order.');
      navigation.navigate('Login');
      return;
    }

    if (!deliveryAddress.trim()) {
      showAlert('Address Required', 'Please enter a valid delivery address.');
      return;
    }

    if (cartItems.length === 0) {
      showAlert('Empty Cart', 'Your cart is empty. Add items before placing an order.');
      return;
    }

    try {
      setSubmitting(true);
      const itemsPayload = cartItems.map((item) => ({
        foodItemId: item._id,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await apiClient.post('/orders', {
        items: itemsPayload,
        deliveryAddress: deliveryAddress.trim(),
      });

      if (res.data.success) {
        const orderObj = res.data.data;
        clearCart();
        navigation.navigate('OrderSuccess', { order: orderObj });
      }
    } catch (error) {
      console.error('Place order error:', error);
      showAlert('Order Failed', error.response?.data?.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri: item.image?.startsWith('http')
            ? item.image
            : `http://localhost:5001${item.image}`,
        }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>Rs. {Math.round(item.price)}</Text>

        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item._id, item.quantity - 1)}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item._id, item.quantity + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromCart(item._id)}
      >
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart 🛒</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Browse meals and add items to order!</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.checkoutBox}>
            <Text style={styles.addressLabel}>Delivery Address</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter full delivery address..."
              placeholderTextColor="#9CA3AF"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
            />

            <View style={styles.breakdownContainer}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>Rs. {Math.round(subtotal)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Delivery Fee</Text>
                <Text style={styles.breakdownValue}>Rs. {Math.round(DELIVERY_FEE)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>Rs. {Math.round(grandTotal)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.placeOrderBtn, submitting && styles.disabledBtn]}
              disabled={submitting}
              onPress={handlePlaceOrder}
              activeOpacity={0.88}
            >
              <Text style={styles.placeOrderBtnText}>
                {submitting ? 'PROCESSING ORDER...' : 'PLACE ORDER 🚀'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 44,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: '#E53935', // Crimson Red Price
    fontWeight: '700',
    marginBottom: 8,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qtyText: {
    color: '#1F2937',
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
  removeBtn: {
    padding: 8,
  },
  removeBtnText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
  },
  addressLabel: {
    color: '#374151',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  addressInput: {
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  breakdownContainer: {
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  breakdownValue: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  totalLabel: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: '#E53935', // Crimson Red Total
    fontSize: 22,
    fontWeight: '800',
  },
  placeOrderBtn: {
    backgroundColor: '#E53935', // Crimson Red Button from photo
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledBtn: {
    opacity: 0.65,
  },
  placeOrderBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySub: {
    color: '#6B7280',
    fontSize: 14,
  },
});
