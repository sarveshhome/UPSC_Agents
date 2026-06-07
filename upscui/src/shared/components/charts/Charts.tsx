import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

// ── Bar Chart ─────────────────────────────────────────────────
interface BarData { label: string; value: number; color?: string; }
export const BarChart: React.FC<{ data: BarData[]; title?: string; maxValue?: number }> = ({
  data, title, maxValue,
}) => {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);
  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.barsRow}>
        {data.map((d, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={styles.barValue}>{d.value}</Text>
            <View style={[styles.bar, { height: Math.max((d.value / max) * 100, 2), backgroundColor: d.color ?? colors.primary }]} />
            <Text style={styles.barLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Line Chart (sparkline) ────────────────────────────────────
export const LineChart: React.FC<{ data: number[]; labels?: string[]; title?: string; color?: string }> = ({
  data, labels, title, color = colors.primary,
}) => {
  const max = Math.max(...data, 1);
  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.barsRow}>
        {data.map((v, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={styles.barValue}>{v}</Text>
            <View style={[styles.bar, { height: Math.max((v / max) * 80, 2), backgroundColor: color }]} />
            {labels && <Text style={styles.barLabel}>{labels[i]}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Pie / Donut Chart (segment blocks) ───────────────────────
interface PieSlice { label: string; value: number; color: string; }
export const PieChart: React.FC<{ data: PieSlice[]; title?: string }> = ({ data, title }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.pieRow}>
        {data.map((d, i) => (
          <View key={i} style={[styles.pieSegment, { flex: d.value / total, backgroundColor: d.color }]} />
        ))}
      </View>
      <View style={styles.legendRow}>
        {data.map((d, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <Text style={styles.barLabel}>{d.label} ({Math.round((d.value / total) * 100)}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Radar Chart (accuracy per subject) ───────────────────────
interface RadarItem { subject: string; accuracy: number; }
export const RadarChart: React.FC<{ data: RadarItem[]; title?: string }> = ({ data, title }) => (
  <View style={styles.card}>
    {title && <Text style={styles.title}>{title}</Text>}
    {data.map((d, i) => (
      <View key={i} style={styles.radarRow}>
        <Text style={[styles.barLabel, { width: 110 }]}>{d.subject}</Text>
        <View style={styles.radarTrack}>
          <View style={[styles.radarFill, { width: `${d.accuracy}%`, backgroundColor: accuracyColor(d.accuracy) }]} />
        </View>
        <Text style={styles.barValue}>{d.accuracy}%</Text>
      </View>
    ))}
  </View>
);

const accuracyColor = (v: number) =>
  v >= 75 ? colors.success : v >= 50 ? colors.secondary : colors.error;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, elevation: 2 },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 130 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '80%', borderRadius: 4 },
  barLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  barValue: { fontSize: 10, color: colors.text, marginBottom: 2 },
  pieRow: { flexDirection: 'row', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: spacing.sm },
  pieSegment: { height: '100%' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  radarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  radarTrack: { flex: 1, height: 10, backgroundColor: colors.border, borderRadius: 5, marginHorizontal: spacing.xs, overflow: 'hidden' },
  radarFill: { height: '100%', borderRadius: 5 },
});
