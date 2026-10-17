import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Animated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing, CommonStyles } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { mockCampuses } from '../../services/mockData';
import { CampusCode } from '../../types';

interface HeaderBarProps {
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  unreadCount?: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onSearchPress,
  onNotificationsPress,
  title,
  showBack = false,
  onBackPress,
  unreadCount = 2,
}) => {
  const insets = useSafeAreaInsets();
  const { currentCampus, setCurrentCampus } = useAuth();
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);

  const badgeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (unreadCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgeScale, { toValue: 1.18, duration: 600, useNativeDriver: true }),
          Animated.timing(badgeScale, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.delay(2400),
        ])
      ).start();
    }
  }, [unreadCount]);

  const selectedCampusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  return (
    <View style={[styles.header, { paddingTop: insets.top, height: 54 + insets.top }, CommonStyles.headerShadow]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/fhub-remove-background.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.brandTextCol}>
              <View style={styles.logoTitleRow}>
                <Text style={styles.logoText}>FHub</Text>
                <View style={styles.eduTag}>
                  <Text style={styles.eduText}>EDU</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {title ? (
          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          /* Campus Selector */
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsCampusModalOpen(true)}
            style={styles.campusButton}
          >
            <Feather name="map-pin" size={12} color={Colors.primary} />
            <Text style={styles.campusText}>{selectedCampusObj.code}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.rightContainer}>
        {onSearchPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onSearchPress}
            style={styles.iconButton}
          >
            <Feather name="search" size={19} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {onNotificationsPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotificationsPress}
            style={styles.iconButton}
          >
            <Feather name="bell" size={19} color={Colors.textSecondary} />
            {unreadCount > 0 && (
              <Animated.View style={[styles.badgeDot, { transform: [{ scale: badgeScale }] }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Campus Selector Modal */}
      <Modal
        visible={isCampusModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCampusModalOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsCampusModalOpen(false)}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn cơ sở đào tạo</Text>
            <FlatList
              data={mockCampuses}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.campusItem,
                    item.code === currentCampus && styles.campusItemActive,
                  ]}
                  onPress={() => {
                    setCurrentCampus(item.code as CampusCode);
                    setIsCampusModalOpen(false);
                  }}
                >
                  <View style={styles.campusInfo}>
                    <Text
                      style={[
                        styles.campusName,
                        item.code === currentCampus && styles.activeCampusText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.campusLocation}>{item.location}</Text>
                  </View>
                  {item.code === currentCampus && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: Colors.glassBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.7)',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  logoImage: {
    width: 34,
    height: 34,
    marginRight: 6,
  },
  brandTextCol: {
    marginRight: 8,
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  eduTag: {
    backgroundColor: 'rgba(239, 246, 255, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: 4,
  },
  eduText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  campusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 4,
  },
  campusText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.text,
  },
  pageTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '900',
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
  },
  badgeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlayTranslucent,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  campusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  campusItemActive: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  campusInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  campusName: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.text,
  },
  activeCampusText: {
    color: Colors.primary,
  },
  campusLocation: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
