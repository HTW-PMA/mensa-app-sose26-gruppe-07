import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { Canteen } from '../../types/api';

interface CanteenSelectorProps {
  canteens: Canteen[];
  selectedCanteen?: Canteen;
  onSelect: (canteen: Canteen) => void;
  loading?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function CanteenSelector({
  canteens,
  selectedCanteen,
  onSelect,
  loading = false,
  isFavorite = false,
  onToggleFavorite,
}: CanteenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase('de-DE');
  const filteredCanteens = useMemo(
    () =>
      canteens.filter((canteen) =>
        `${canteen.name} ${canteen.address ?? ''}`
          .toLocaleLowerCase('de-DE')
          .includes(normalizedSearch),
      ),
    [canteens, normalizedSearch],
  );

  const close = () => {
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <View style={styles.wrapper}>
        <Text style={styles.eyebrow}>AUSGEWÄHLTE MENSA</Text>
        <Pressable
          style={styles.selector}
          onPress={() => setOpen(true)}
          disabled={loading || canteens.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Ausgewählte Mensa ändern"
        >
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={20} color={COLORS.white} />
          </View>
          <View style={styles.selectorContent}>
            {loading ? (
              <ActivityIndicator color={COLORS.waldgruen} size="small" />
            ) : (
              <>
                <Text style={styles.selectedName} numberOfLines={2}>
                  {selectedCanteen?.name ?? 'Mensa auswählen'}
                </Text>
                {selectedCanteen?.address ? (
                  <Text style={styles.selectedAddress} numberOfLines={1}>
                    {selectedCanteen.address}
                  </Text>
                ) : null}
              </>
            )}
          </View>
          <View style={styles.selectorActions}>
            {onToggleFavorite && selectedCanteen ? (
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onToggleFavorite();
                }}
                style={styles.favoriteButton}
                accessibilityRole="button"
                accessibilityLabel={
                  isFavorite ? 'Mensa aus Favoriten entfernen' : 'Mensa favorisieren'
                }
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={COLORS.waldgruen}
                />
              </Pressable>
            ) : null}
            <View style={styles.changeAction}>
              <Text style={styles.changeText}>Ändern</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.waldgruen} />
            </View>
          </View>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Mensaauswahl schließen"
          />
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>DEINE AUSWAHL</Text>
                <Text style={styles.sheetTitle}>Mensa wechseln</Text>
              </View>
              <Pressable
                onPress={close}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Schließen"
              >
                <Ionicons name="close" size={22} color={COLORS.waldgruen} />
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={COLORS.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                placeholder="Mensa oder Adresse suchen"
                placeholderTextColor={COLORS.textMuted}
                autoFocus
              />
            </View>

            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filteredCanteens.map((canteen) => {
                const selected = canteen.id === selectedCanteen?.id;
                return (
                  <Pressable
                    key={canteen.id}
                    onPress={() => {
                      onSelect(canteen);
                      close();
                    }}
                    style={[styles.option, selected && styles.optionSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <View style={styles.optionIcon}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={COLORS.waldgruen}
                      />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionName}>{canteen.name}</Text>
                      {canteen.address ? (
                        <Text style={styles.optionAddress}>{canteen.address}</Text>
                      ) : null}
                    </View>
                    {selected ? (
                      <View style={styles.selectedCheck}>
                        <Ionicons name="checkmark" size={16} color={COLORS.white} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
              {filteredCanteens.length === 0 ? (
                <Text style={styles.emptyText}>Keine passende Mensa gefunden.</Text>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.salbeigruen,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 12,
  },
  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.waldgruen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectorContent: {
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.waldgruen,
    lineHeight: 18,
  },
  selectedAddress: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectorActions: {
    alignItems: 'flex-end',
    marginLeft: 8,
    gap: 4,
  },
  favoriteButton: {
    padding: 2,
  },
  changeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(26, 35, 20, 0.45)',
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.salbeigruen,
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.waldgruen,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.creme,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.md,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.waldgruen,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  listContent: {
    paddingBottom: 20,
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 12,
  },
  optionSelected: {
    borderColor: COLORS.waldgruen,
    backgroundColor: COLORS.creme,
  },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.creme,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  optionAddress: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.waldgruen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginVertical: 24,
  },
});
