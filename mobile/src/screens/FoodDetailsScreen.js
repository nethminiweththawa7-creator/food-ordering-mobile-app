import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CartContext } from '../context/CartContext';

export default function FoodDetailsScreen({ route, navigation }) {
  const { foodItem } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  const imageUrl = foodItem.image?.startsWith('http')
    ? foodItem.image
    : `http://localhost:5001${foodItem.image}`;

  const handleAddToCart = () => {
    addToCart(foodItem, quantity);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{foodItem.category || 'Food'}</Text>
          </View>
          <Text style={styles.title}>{foodItem.name}</Text>
          <Text style={styles.price}>Rs. {Math.round(foodItem.price)}</Text>

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>{foodItem.description}</Text>

          <View style={styles.quantityContainer}>
            <Text style={styles.sectionHeader}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Add Button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            Rs. {Math.round(Number(foodItem.price) * quantity)}
          </Text>
        </View>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addCartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  image: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 45,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  backButtonText: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFFFFF',
    marginTop: -25,
    elevation: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  categoryText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 25,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  qtyBtnText: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: 'bold',
  },
  qtyText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
  },
  totalLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  totalPrice: {
    color: '#E53935',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addCartBtn: {
    backgroundColor: '#E53935',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
