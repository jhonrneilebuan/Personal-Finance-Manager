import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';
import { aiApi } from '@/services/ai.service';
import { palette } from '@/theme/theme';
import type { AiSpendingPlan, PurchasePlanItem } from '@/types/ai';
import { formatCurrency } from '@/utils/currency';

type AiSpendingPlannerCardProps = {
  defaultAvailableMoney: number;
};

const needKeywords = ['rice', 'food', 'grocery', 'rent', 'bill', 'electric', 'water', 'medicine', 'school', 'tuition', 'fare', 'load', 'internet'];
const wantKeywords = ['phone', 'shoes', 'game', 'shirt', 'clothes', 'watch', 'gadget', 'upgrade'];

const decisionLabels: Record<AiSpendingPlan['decisions'][number]['decision'], string> = {
  buy_now: 'Buy now',
  buy_later: 'Buy later',
  save_for: 'Save first',
  skip: 'Skip',
};

const parseItems = (value: string): PurchasePlanItem[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const amountMatch = line.match(/(?:php|p)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)(?!.*[0-9])/i);
      const estimatedCost = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 0;
      const name = amountMatch ? line.replace(amountMatch[0], '').replace(/[-:,]+$/, '').trim() : line;
      const normalized = name.toLowerCase();
      const priority: PurchasePlanItem['priority'] = needKeywords.some((keyword) => normalized.includes(keyword))
        ? 'need'
        : wantKeywords.some((keyword) => normalized.includes(keyword))
          ? 'want'
          : 'optional';

      return { name: name || line, estimatedCost, priority };
    })
    .filter((item) => item.name.length >= 2 && Number.isFinite(item.estimatedCost) && item.estimatedCost > 0)
    .slice(0, 15);

export function AiSpendingPlannerCard({ defaultAvailableMoney }: AiSpendingPlannerCardProps) {
  const theme = useTheme();
  const [availableMoney, setAvailableMoney] = useState(String(Math.max(0, Math.round(defaultAvailableMoney))));
  const [itemsText, setItemsText] = useState('');
  const [plan, setPlan] = useState<AiSpendingPlan | null>(null);
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const parsedItems = useMemo(() => parseItems(itemsText), [itemsText]);

  const generatePlan = useCallback(async () => {
    const amount = Number(availableMoney);

    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice('Enter money available first');
      return;
    }

    if (parsedItems.length === 0) {
      setNotice('Add items with price, one per line');
      return;
    }

    try {
      setIsLoading(true);
      setNotice('');
      setPlan(await aiApi.spendingPlan({ availableMoney: amount, items: parsedItems }));
    } catch {
      setNotice('Unable to create spending plan');
    } finally {
      setIsLoading(false);
    }
  }, [availableMoney, parsedItems]);

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="cart-check" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text variant="titleMedium" style={styles.title}>AI Spending Planner</Text>
            <Text style={styles.subtitle}>Ranks what to buy first and how to split your money.</Text>
          </View>
        </View>

        <TextInput
          left={<TextInput.Icon icon="wallet-outline" />}
          mode="outlined"
          label="Money available"
          keyboardType="numeric"
          value={availableMoney}
          onChangeText={setAvailableMoney}
        />
        <TextInput
          left={<TextInput.Icon icon="format-list-bulleted" />}
          mode="outlined"
          label="Items to buy, one per line"
          placeholder={'Rice 1000\nShoes 1200\nPhone 8000'}
          multiline
          numberOfLines={4}
          value={itemsText}
          onChangeText={setItemsText}
        />
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Button icon="auto-fix" mode="contained" loading={isLoading} disabled={isLoading} onPress={generatePlan}>
          Plan What To Buy First
        </Button>

        {plan ? (
          <View style={styles.result}>
            <View>
              <Text variant="titleSmall" style={styles.resultTitle}>{plan.title}</Text>
              <Text style={styles.summary}>{plan.summary}</Text>
            </View>

            <View style={styles.budgetRow}>
              <View style={styles.budgetBox}>
                <Text style={styles.budgetLabel}>Essentials</Text>
                <Text style={styles.budgetValue}>{formatCurrency(plan.recommendedBudget.essentials)}</Text>
              </View>
              <View style={styles.budgetBox}>
                <Text style={styles.budgetLabel}>Flexible</Text>
                <Text style={styles.budgetValue}>{formatCurrency(plan.recommendedBudget.flexible)}</Text>
              </View>
              <View style={styles.budgetBox}>
                <Text style={styles.budgetLabel}>Savings</Text>
                <Text style={styles.budgetValue}>{formatCurrency(plan.recommendedBudget.savings)}</Text>
              </View>
            </View>

            <View style={styles.decisions}>
              {plan.decisions.map((item) => (
                <View key={`${item.item}-${item.decision}`} style={styles.decisionItem}>
                  <View style={styles.decisionTop}>
                    <Text variant="titleSmall" style={styles.itemName}>{item.item}</Text>
                    <Text style={[styles.decisionBadge, item.decision === 'buy_now' ? styles.buyNow : undefined]}>
                      {decisionLabels[item.decision]}
                    </Text>
                  </View>
                  <Text style={styles.summary}>{formatCurrency(item.estimatedCost)} - {item.reason}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <Text variant="labelLarge" style={styles.actionTitle}>Budget steps</Text>
              {plan.actionItems.map((item) => <Text key={item} style={styles.summary}>- {item}</Text>)}
            </View>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  actionTitle: { fontWeight: '900' },
  actions: { gap: 5 },
  budgetBox: { backgroundColor: 'rgba(120,120,120,0.08)', borderRadius: 8, flex: 1, gap: 3, minWidth: 92, padding: 11 },
  budgetLabel: { color: palette.slate, fontSize: 12, fontWeight: '800' },
  budgetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  budgetValue: { fontWeight: '900' },
  buyNow: { backgroundColor: 'rgba(52,199,89,0.16)', color: palette.green },
  card: { borderRadius: 8 },
  content: { gap: 14, paddingVertical: 18 },
  decisionBadge: { backgroundColor: 'rgba(120,120,120,0.12)', borderRadius: 8, color: palette.slate, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  decisionItem: { gap: 5 },
  decisionTop: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  decisions: { gap: 13 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  headerCopy: { flex: 1 },
  iconBox: { alignItems: 'center', borderRadius: 8, height: 46, justifyContent: 'center', width: 46 },
  itemName: { flex: 1, fontWeight: '900' },
  notice: { color: palette.red, fontWeight: '700' },
  result: { gap: 14 },
  resultTitle: { fontWeight: '900' },
  subtitle: { opacity: 0.68 },
  summary: { lineHeight: 20, opacity: 0.78 },
  title: { fontWeight: '900' },
});
