import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Props = {
  title?: string;
  showBack?: boolean;
};

export function AppHeader({ title, showBack }: Props) {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const loadUnread = async () => {
      if (!user) return;
      try {
        const notifs = await apiService.get(`/notifications/${user.id}`);
        if (notifs && Array.isArray(notifs)) {
          setHasUnread(notifs.some((n: any) => !n.read));
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    if (isFocused) {
      loadUnread();
    }
  }, [isFocused, user]);

  return (
    <View style={{ width: '100%', paddingTop: 48, paddingBottom: 12, paddingHorizontal: 20, backgroundColor: colors.background, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Left side: Logo or Back Button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {showBack ? (
          <TouchableOpacity 
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="fitness-center" size={20} color={colors.onPrimary} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>FITSYNC</Text>
          </View>
        )}
        {title && showBack && (
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{title}</Text>
        )}
      </View>

      {/* Right side: Icons */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Theme Toggle */}
        <TouchableOpacity 
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
          onPress={toggleTheme}
        >
          <MaterialIcons name={isDark ? "light-mode" : "dark-mode"} size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity 
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, position: 'relative' }}
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialIcons name="notifications" size={20} color={colors.text} />
          {hasUnread && (
            <View style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
          )}
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity 
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
          onPress={() => navigation.navigate('Settings')}
        >
          <MaterialIcons name="settings" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
