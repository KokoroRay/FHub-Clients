import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
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
  const { currentCampus, setCurrentCampus } = useAuth();
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);

  const selectedCampusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  return (
    <View style={[styles.header, CommonStyles.headerShadow]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            {/* Logo Avatar */}
            <View style={styles.logoBadge}>
              <Text style={styles.logoInitial}>F</Text>
            </View>
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
            <Feather name="search" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {onNotificationsPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotificationsPress}
            style={styles.iconButton}
          >
            <Feather name="bell" size={20} color={Colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
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
    height: 56,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoInitial: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  },
  brandTextCol: {
    marginRight: 8,
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  eduTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
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
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  campusText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.text,
  },
  pageTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '800',
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '800',
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
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
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
