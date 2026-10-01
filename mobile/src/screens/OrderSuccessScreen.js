import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export default function OrderSuccessScreen({ route, navigation }) {
  const order = route.params?.order || {};
  const orderId = order._id ? String(order._id).slice(-6) : '998241';
  const totalAmount = order.totalAmount ? Math.round(Number(order.totalAmount)) : '0';
  const address = order.deliveryAddress || '123 Main Street, City';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon Badge */}
        <View style={styles.iconWrapper}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>

        <Text style={styles.successTitle}>Order Placed Successfully!</Text>
        <Text style={styles.successSub}>
          Thank you for your order. We've received it and the kitchen is preparing your delicious meal.
        </Text>

        {/* Order Details Summary Card */}
        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.value}>#{orderId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount Paid</Text>
            <Text style={styles.priceValue}>Rs. {totalAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Address</Text>
            <Text style={styles.value} numberOfLines={1}>{address}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Delivery</Text>
            <Text style={styles.timeValue}>25 - 35 mins</Text>
          </View>
        </View>

        {/* Order Tracking Progress Timeline */}
        <View style={styles.trackerCard}>
          <Text style={styles.trackerTitle}>Live Order Status</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.dotDone]}>
              <Text style={styles.dotText}>✓</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStepDone}>Order Placed</Text>
              <Text style={styles.timelineDesc}>Order received by restaurant</Text>
            </View>
          </View>

          <View style={styles.timelineLineActive} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.dotActive]}>
              <Text style={styles.dotText}>🍳</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStepActive}>Preparing Meal</Text>
              <Text style={styles.timelineDesc}>Chef is cooking your fresh order</Text>
            </View>
          </View>

          <View style={styles.timelineLinePending} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.dotPending]}>
              <Text style={styles.dotTextPending}>🛵</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStepPending}>Out for Delivery</Text>
              <Text style={styles.timelineDesc}>Courier on the way to your doorstep</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.trackOrdersBtn}
          onPress={() => navigation.navigate('Orders')}
          activeOpacity={0.88}
        >
          <Text style={styles.trackOrdersBtnText}>View All Orders 📦</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.88}
        >
          <Text style={styles.homeBtnText}>Back to Home Menu 🍔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Clean Light Theme Background
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  successIcon: {
    fontSize: 44,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: '#6B7280',
    fontSize: 14,
  },
  value: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '700',
  },
  priceValue: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '800',
  },
  timeValue: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '800',
  },
  trackerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    elevation: 3,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  trackerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotDone: {
    backgroundColor: '#10B981',
  },
  dotActive: {
    backgroundColor: '#E53935',
  },
  dotPending: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dotText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  dotTextPending: {
    fontSize: 14,
  },
  timelineContent: {
    marginLeft: 14,
  },
  timelineStepDone: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  timelineStepActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  timelineStepPending: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  timelineDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  timelineLineActive: {
    width: 2,
    height: 24,
    backgroundColor: '#E53935',
    marginLeft: 15,
    marginVertical: 4,
  },
  timelineLinePending: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginLeft: 15,
    marginVertical: 4,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  trackOrdersBtn: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  trackOrdersBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  homeBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  homeBtnText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 15,
  },
});
