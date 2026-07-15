import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';
import { aiApi } from '@/services/ai.service';
import { palette } from '@/theme/theme';
import type { AiSpendingPlan, PurchasePlanItem } from '@/types/ai';
import { formatCurrency } from '@/utils/currency';
import { PisoPilotMascot } from './PisoPilotMascot';

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
    <Card 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          borderWidth: theme.dark ? 1 : 0,
        }
      ]}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <PisoPilotMascot size={58} mood={plan ? 'happy' : 'thinking'} />
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}12` }]}>
            <MaterialCommunityIcons name="cart-check" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>AI Spending Planner</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Ranks what to buy first and how to split your money.</Text>
          </View>
        </View>

        <TextInput
          left={<TextInput.Icon icon="wallet-outline" color="rgba(120,120,120,0.5)" />}
          mode="outlined"
          label="Money available"
          keyboardType="numeric"
          value={availableMoney}
          onChangeText={setAvailableMoney}
          theme={{ roundness: 12 }}
        />
        <TextInput
          left={<TextInput.Icon icon="format-list-bulleted" color="rgba(120,120,120,0.5)" />}
          mode="outlined"
          label="Items to buy, one per line"
          placeholder={'Rice 1000\nShoes 1200\nPhone 8000'}
          multiline
          numberOfLines={4}
          value={itemsText}
          onChangeText={setItemsText}
          theme={{ roundness: 12 }}
        />
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Button 
          icon="auto-fix" 
          mode="contained" 
          buttonColor={palette.forest}
          style={styles.planButton}
          contentStyle={styles.buttonContent}
          loading={isLoading} 
          disabled={isLoading} 
          onPress={generatePlan}
        >
          Plan What To Buy First
        </Button>

        {plan ? (
          <View style={styles.result}>
            <View>
              <Text style={[styles.resultTitle, { color: theme.colors.onSurface }]}>{plan.title}</Text>
              <Text style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}>{plan.summary}</Text>
            </View>

            <View style={styles.budgetRow}>
              <View style={[styles.budgetBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={styles.budgetLabel}>Essentials</Text>
                <Text style={[styles.budgetValue, { color: theme.colors.onSurface }]}>{formatCurrency(plan.recommendedBudget.essentials)}</Text>
              </View>
              <View style={[styles.budgetBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={styles.budgetLabel}>Flexible</Text>
                <Text style={[styles.budgetValue, { color: theme.colors.onSurface }]}>{formatCurrency(plan.recommendedBudget.flexible)}</Text>
              </View>
              <View style={[styles.budgetBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={styles.budgetLabel}>Savings</Text>
                <Text style={[styles.budgetValue, { color: theme.colors.onSurface }]}>{formatCurrency(plan.recommendedBudget.savings)}</Text>
              </View>
            </View>

            <View style={styles.decisions}>
              {plan.decisions.map((item) => (
                <View key={`${item.item}-${item.decision}`} style={[styles.decisionItem, { borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant, paddingBottom: 10 }]}>
                  <View style={styles.decisionTop}>
                    <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>{item.item}</Text>
                    <Text style={[styles.decisionBadge, item.decision === 'buy_now' ? styles.buyNow : undefined]}>
                      {decisionLabels[item.decision]}
                    </Text>
                  </View>
                  <Text style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}>{formatCurrency(item.estimatedCost)} - {item.reason}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <Text style={[styles.actionTitle, { color: theme.colors.onSurface }]}>Budget steps</Text>
              {plan.actionItems.map((item) => (
                <Text key={item} style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}>• {item}</Text>
              ))}
            </View>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  actionTitle: { fontWeight: '800', fontSize: 13, letterSpacing: -0.1 },
  actions: { gap: 4, marginTop: 4 },
  budgetBox: { borderRadius: 12, flex: 1, gap: 2, minWidth: 90, padding: 10 },
  budgetLabel: { color: palette.slate, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  budgetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  budgetValue: { fontWeight: '900', fontSize: 15, letterSpacing: -0.2 },
  buyNow: { backgroundColor: 'rgba(52,199,89,0.12)', color: palette.green },
  card: { 
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: { gap: 14, paddingVertical: 20 },
  decisionBadge: { 
    backgroundColor: 'rgba(120,120,120,0.12)', 
    borderRadius: 8, 
    color: palette.slate, 
    fontWeight: '800', 
    overflow: 'hidden', 
    paddingHorizontal: 8, 
    paddingVertical: 4,
    fontSize: 11,
  },
  decisionItem: { gap: 4 },
  decisionTop: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  decisions: { gap: 10 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  headerCopy: { flex: 1 },
  iconBox: { alignItems: 'center', borderRadius: 14, height: 40, justifyContent: 'center', width: 40 },
  itemName: { flex: 1, fontWeight: '800', fontSize: 14, letterSpacing: -0.1 },
  notice: { color: palette.red, fontWeight: '700', fontSize: 13 },
  result: { gap: 14, marginTop: 6 },
  resultTitle: { fontWeight: '800', fontSize: 15, letterSpacing: -0.1 },
  subtitle: { opacity: 0.6, fontSize: 12, fontWeight: '500' },
  summary: { lineHeight: 18, opacity: 0.8, fontSize: 13 },
  title: { fontWeight: '800', fontSize: 15, letterSpacing: -0.2 },
  planButton: { borderRadius: 12 },
  buttonContent: { height: 44 },
});
