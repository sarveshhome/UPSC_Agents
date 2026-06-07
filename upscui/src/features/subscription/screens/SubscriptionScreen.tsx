import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionStatusQuery,
  useSubscribeMutation,
} from '../../../store/api';
import { colors, spacing, typography } from '../../../shared/theme';

export const SubscriptionScreen: React.FC = () => {
  const { data: plans, isLoading: plansLoading } = useGetSubscriptionPlansQuery();
  const { data: status, refetch: refetchStatus } = useGetSubscriptionStatusQuery();
  const [subscribe, { isLoading: subscribing }] = useSubscribeMutation();

  const handleSubscribe = async (planId: string, price: number) => {
    if (price === 0) {
      await subscribe({ planId });
      refetchStatus();
      return;
    }
    // Razorpay integration point
    // In production: RazorpayCheckout.open(options) -> get paymentId -> call subscribe
    Alert.alert(
      'Razorpay',
      `Initiating payment for ₹${price}.\nIntegrate RazorpayCheckout SDK here.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Payment', onPress: async () => {
            const orderId = `order_${Date.now()}`;
            const paymentId = `pay_${Date.now()}`;
            await subscribe({ planId, razorpayOrderId: orderId, razorpayPaymentId: paymentId });
            refetchStatus();
          }
        },
      ]
    );
  };

  if (plansLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Subscription</Text>

      {status && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>
            Current Plan: <Text style={{ color: colors.primary }}>{status.planName ?? 'Free'}</Text>
            {status.expiresAt ? `  ·  Expires: ${status.expiresAt?.slice(0, 10)}` : ''}
          </Text>
        </View>
      )}

      {plans?.map((plan: any) => (
        <View key={plan.id} style={[styles.card, plan.name === 'Premium' && styles.highlighted]}>
          {plan.name === 'Premium' && <Text style={styles.badge}>BEST VALUE</Text>}
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.price}>{plan.price === 0 ? 'Free' : `₹${plan.price}`}
            <Text style={styles.duration}> / {plan.duration >= 36500 ? 'forever' : `${plan.duration} days`}</Text>
          </Text>
          {plan.features.map((f: string, i: number) => (
            <Text key={i} style={styles.feature}>✓  {f}</Text>
          ))}
          <TouchableOpacity
            style={[styles.btn, status?.planId === plan.id && styles.btnActive]}
            disabled={status?.planId === plan.id || subscribing}
            onPress={() => handleSubscribe(plan.id, plan.price)}
          >
            <Text style={styles.btnText}>
              {status?.planId === plan.id ? 'Current Plan' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  statusBanner: {
    backgroundColor: colors.card, borderRadius: 8, padding: spacing.sm,
    marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  statusText: { ...typography.body, color: colors.text },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: spacing.lg,
    marginBottom: spacing.md, elevation: 2,
  },
  highlighted: { borderWidth: 2, borderColor: colors.primary },
  badge: {
    alignSelf: 'flex-start', backgroundColor: colors.primary, color: '#fff',
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4,
    fontSize: 11, fontWeight: '700', marginBottom: spacing.xs,
  },
  planName: { ...typography.h2, color: colors.text },
  price: { ...typography.h3, color: colors.primary, marginVertical: spacing.xs },
  duration: { ...typography.caption, color: colors.textSecondary },
  feature: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  btn: {
    backgroundColor: colors.primary, borderRadius: 10,
    padding: spacing.sm, alignItems: 'center', marginTop: spacing.md,
  },
  btnActive: { backgroundColor: colors.success },
  btnText: { color: '#fff', fontWeight: '700', ...typography.body },
});
