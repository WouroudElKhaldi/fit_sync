import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiService } from '../services/api';
import { useAppTheme } from '../context/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ExerciseSelector'>;
};

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  display: string;
}

const PAGE_SIZE = 20;

export default function ExerciseSelectorScreen({ navigation }: Props) {
  const { colors } = useAppTheme();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleCategories, setMuscleCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states — separate initial vs paginating
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Track the "active" request sequence to discard stale responses
  const requestSeqRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ─── Load muscle categories once ─────────────────────────────────────────
  useEffect(() => {
    async function loadMuscles() {
      try {
        const data = await apiService.get('/exercises/muscles');
        if (!isMountedRef.current) return;
        const cats = Array.from(
          new Set((data as any[]).map((m: any) => m.category).filter(Boolean))
        ).sort() as string[];
        setMuscleCategories(cats);
      } catch (err) {
        console.error('Failed to load muscles:', err);
      }
    }
    loadMuscles();
  }, []);

  // ─── Core fetch ───────────────────────────────────────────────────────────
  const fetchExercises = useCallback(
    async (query: string, category: string, pageNum: number, append: boolean, seq: number) => {
      if (append) setLoadingMore(true);
      else setInitialLoading(true);

      try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        if (category !== 'All') params.append('muscleCategory', category);
        params.append('page', String(pageNum));
        params.append('limit', String(PAGE_SIZE));

        const res = await apiService.get(`/exercises?${params.toString()}`);

        // Discard if a newer request has been issued
        if (!isMountedRef.current || seq !== requestSeqRef.current) return;

        const formatted: Exercise[] = (res.data || []).map((ex: any) => {
          const primaryMuscle =
            ex.muscles?.find((m: any) => m.targetType === 'PRIMARY')?.muscle?.name || 'Full Body';
          const equipment = ex.equipment?.name || 'Bodyweight';
          return {
            id: ex.id,
            name: ex.name,
            category: primaryMuscle,
            equipment,
            display: `${equipment} • ${primaryMuscle}`,
          };
        });

        setTotalPages(res.totalPages ?? 1);
        setTotal(res.total ?? 0);
        setExercises(prev => (append ? [...prev, ...formatted] : formatted));
      } catch (err) {
        if (!isMountedRef.current || seq !== requestSeqRef.current) return;
        console.error('Failed to load exercises:', err);
      } finally {
        if (isMountedRef.current && seq === requestSeqRef.current) {
          setInitialLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  // ─── React to search / category changes (debounced) ───────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Reset pagination states immediately to prevent stale loadMore calls during debounce
    setPage(1);
    setTotalPages(1);

    debounceRef.current = setTimeout(() => {
      // Bump seq so any in-flight request for a previous query is discarded
      const seq = requestSeqRef.current + 1;
      requestSeqRef.current = seq;
      setExercises([]);           // clear immediately — avoids stale list flash
      fetchExercises(searchQuery, selectedCategory, 1, false, seq);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedCategory, fetchExercises]);

  // ─── Load more (pagination) ───────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loadingMore || initialLoading || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    const seq = requestSeqRef.current; // same request "era" — just next page
    fetchExercises(searchQuery, selectedCategory, nextPage, true, seq);
  }, [loadingMore, initialLoading, page, totalPages, searchQuery, selectedCategory, fetchExercises]);

  // ─── Toggle exercise selection ─────────────────────────────────────────────
  const toggleExercise = useCallback((ex: Exercise) => {
    setSelectedExercises(prev =>
      prev.find(e => e.id === ex.id) ? prev.filter(e => e.id !== ex.id) : [...prev, ex]
    );
  }, []);

  const isSelected = (id: string) => !!selectedExercises.find(e => e.id === id);

  // ─── Render item (stable reference) ──────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: Exercise }) => {
    const selected = isSelected(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleExercise(item)}
        style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 20, paddingVertical: 14,
          borderBottomWidth: 1, borderColor: colors.border,
          backgroundColor: selected ? colors.primary + '18' : 'transparent',
        }}
      >
        <View style={{
          width: 46, height: 46, borderRadius: 10,
          backgroundColor: colors.surfaceContainerHigh,
          alignItems: 'center', justifyContent: 'center',
          marginRight: 14, borderWidth: 1, borderColor: colors.border,
        }}>
          <MaterialIcons name="fitness-center" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{item.name}</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{item.display}</Text>
        </View>
        <View style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: selected ? colors.primary : 'transparent',
          borderWidth: selected ? 0 : 1.5, borderColor: colors.border,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <MaterialIcons name="check" size={15} color={colors.onPrimary} />}
        </View>
      </TouchableOpacity>
    );
  }, [selectedExercises, colors, toggleExercise]);

  // ─── Empty / loading states ───────────────────────────────────────────────
  const ListEmptyComponent = () => {
    if (initialLoading) {
      return (
        <View style={{ alignItems: 'center', paddingTop: 80 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted, marginTop: 12 }}>Loading exercises…</Text>
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'center', paddingTop: 80 }}>
        <MaterialIcons name="search-off" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, fontWeight: '700', marginTop: 12 }}>
          No exercises found
        </Text>
        {selectedCategory !== 'All' && (
          <TouchableOpacity
            onPress={() => setSelectedCategory('All')}
            style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.primary + '20' }}
          >
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
              Clear filter
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const ListFooterComponent = loadingMore ? (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  ) : null;

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ── Sticky Header ── */}
      <View style={{ backgroundColor: colors.background, paddingTop: 52, borderBottomWidth: 1, borderColor: colors.border }}>

        {/* Title row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 48, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="close" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.text }}>
            Add Exercises
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', height: 46,
            backgroundColor: colors.surfaceContainer,
            borderRadius: 12, borderWidth: 1, borderColor: colors.border,
            paddingHorizontal: 12, gap: 8,
          }}>
            <MaterialIcons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: colors.text }}
              placeholder="Search exercises, muscles…"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="clear" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
        >
          {['All', ...muscleCategories].map(cat => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  height: 34, paddingHorizontal: 14, borderRadius: 8,
                  backgroundColor: active ? colors.primary : colors.surfaceContainer,
                  borderWidth: active ? 0 : 1,
                  borderColor: colors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: active ? colors.onPrimary : colors.textMuted }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results count */}
      {!initialLoading && (
        <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>
            {total} exercise{total !== 1 ? 's' : ''}
            {selectedCategory !== 'All' ? ` · ${selectedCategory}` : ''}
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: selectedExercises.length > 0 ? 110 : 40 }}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
      />

      {/* Floating Add Bar */}
      {selectedExercises.length > 0 && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 20, paddingBottom: 32,
          backgroundColor: colors.background,
          borderTopWidth: 1, borderColor: colors.border,
        }}>
          <TouchableOpacity
            style={{
              height: 54, borderRadius: 12,
              backgroundColor: colors.primary,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onPress={() => {
              navigation.navigate('WorkoutBuilder', {
                addedExercises: selectedExercises.map(e => ({ id: e.id, name: e.name }))
              });
            }}
          >
            <MaterialIcons name="add" size={22} color={colors.onPrimary} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.onPrimary }}>
              Add {selectedExercises.length} Exercise{selectedExercises.length !== 1 ? 's' : ''} to Workout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
