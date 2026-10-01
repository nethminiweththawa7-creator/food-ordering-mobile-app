import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import apiClient from '../api/apiClient';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns

const CATEGORIES = [
  { name: 'All', icon: '🍽️' },
  { name: 'Burger', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Meat', icon: '🥩' },
  { name: 'Noodles', icon: '🍜' },
  { name: 'Seafood', icon: '🦐' },
  { name: 'Salad', icon: '🥗' },
];

export default function HomeScreen({ navigation }) {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchFoodItems();
  }, [selectedCategory]);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await apiClient.get('/food-items', { params });
      if (res.data.success) {
        setFoodItems(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchFoodItems();
  };

  const renderGridCard = ({ item }) => {
    const isOutOfStock = item.stockQuantity <= 0 || !item.isAvailable;
    const imageUrl = item.image?.startsWith('http')
      ? item.image
      : `http://localhost:5001${item.image}`;

    return (
      <TouchableOpacity
        style={styles.gridCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('FoodDetails', { foodItem: item })}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>SOLD OUT</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.price}>Rs. {Math.round(item.price)}</Text>
            <TouchableOpacity
              style={[styles.addBtn, isOutOfStock && styles.disabledAddBtn]}
              disabled={isOutOfStock}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.headerSub}>Discover the most delicious food for you</Text>
        </View>
      </View>

      {/* Top Search Bar (Crimson Red Outline matching Pic 3) */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search burgers, pizza, noodles..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Special Offers Crimson Red Banner Card (Matching Pic 3) */}
        <View style={styles.promoBannerCard}>
          <View style={styles.promoTextCol}>
            <Text style={styles.promoSubHeader}>Special Offers</Text>
            <Text style={styles.promoDiscount}>50%</Text>
            <Text style={styles.promoDetails}>Discount Valid For Today Only!</Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' }}
            style={styles.promoImage}
            resizeMode="cover"
          />
        </View>

        {/* Category Crimson Red Square Tiles (Matching Pic 3) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Category</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={[
                styles.categoryTile,
                selectedCategory === cat.name ? styles.categoryTileActive : styles.categoryTileInactive,
              ]}
              onPress={() => setSelectedCategory(cat.name)}
              activeOpacity={0.85}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryTileText,
                  selectedCategory === cat.name ? styles.categoryTileTextActive : styles.categoryTileTextInactive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Item / Recommended 2-Column Grid Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <Text style={styles.itemCountText}>{foodItems.length} items</Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#E53935" />
          </View>
        ) : (
          <FlatList
            data={foodItems}
            keyExtractor={(item) => item._id || String(Math.random())}
            renderItem={renderGridCard}
            numColumns={2}
            columnWrapperStyle={styles.gridColumnWrapper}
            contentContainerStyle={styles.gridContainer}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <Text style={styles.emptyTitle}>No meals found</Text>
                <Text style={styles.emptySub}>Try searching for another dish!</Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Clean Off-White Background matching Pic 3
    paddingTop: 44,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1.5,
    borderColor: '#EF4444', // Soft Crimson Red Outline matching Pic 3
    marginRight: 10,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#1F2937',
    fontSize: 14,
    paddingVertical: 0,
  },
  searchBtn: {
    backgroundColor: '#E53935', // Primary Crimson Red matching Pic 3
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  promoBannerCard: {
    marginHorizontal: 20,
    backgroundColor: '#E53935', // Crimson Red Special Offers Card matching Pic 3
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  promoTextCol: {
    flex: 1,
  },
  promoSubHeader: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  promoDiscount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginVertical: 2,
  },
  promoDetails: {
    color: '#FFEBEE',
    fontSize: 12,
    fontWeight: '600',
  },
  promoImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemCountText: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoryList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTile: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
  },
  categoryTileActive: {
    backgroundColor: '#E53935', // Crimson Red Square Tile matching Pic 3
  },
  categoryTileInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryTileText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTileTextActive: {
    color: '#FFFFFF',
  },
  categoryTileTextInactive: {
    color: '#4B5563',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF', // Clean White Card matching Pic 3
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FEE2E2', // Subtle Red Outline matching Pic 3
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,41,55,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#EF4444',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E53935', // Crimson Red Price matching Pic 3
  },
  addBtn: {
    backgroundColor: '#E53935', // Crimson Red Add Button matching Pic 3
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledAddBtn: {
    backgroundColor: '#9CA3AF',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loaderContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyView: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptySub: {
    color: '#6B7280',
    fontSize: 13,
  },
});
