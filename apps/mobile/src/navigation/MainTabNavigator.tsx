import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { CourseListScreen } from '../screens/courses/CourseListScreen';
import { QuestionListScreen } from '../screens/discussions/QuestionListScreen';
import { ResourcesHubScreen } from '../screens/resources/ResourcesHubScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ARCH_WIDTH = 64;
const BUBBLE_SIZE = 38;
const BAR_MARGIN = 14;
const BAR_HEIGHT = 58;

const TAB_ORDER: (keyof MainTabParamList)[] = [
  'FeedTab',
  'CoursesTab',
  'DiscussionsTab',
  'ResourcesTab',
  'ProfileTab',
];

/**
 * Higher-Order Component that adds smooth horizontal swipe gestures to switch tabs
 */
const withSwipeTabs = (Component: React.ComponentType<any>, tabIndex: number) => {
  return (props: any) => {
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only intercept if horizontal swipe is dominant and exceeds threshold
          const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
          const isSufficient = Math.abs(gestureState.dx) > 28;
          return isHorizontal && isSufficient;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -45 || gestureState.vx < -0.4) {
            // Swipe Left -> Go to Next Tab
            if (tabIndex < TAB_ORDER.length - 1) {
              props.navigation.navigate(TAB_ORDER[tabIndex + 1]);
            }
          } else if (gestureState.dx > 45 || gestureState.vx > 0.4) {
            // Swipe Right -> Go to Prev Tab
            if (tabIndex > 0) {
              props.navigation.navigate(TAB_ORDER[tabIndex - 1]);
            }
          }
        },
      })
    ).current;

    return (
      <View style={styles.swipeContainer} {...panResponder.panHandlers}>
        <Component {...props} />
      </View>
    );
  };
};

const SwipeableFeedScreen = withSwipeTabs(FeedScreen, 0);
const SwipeableCoursesScreen = withSwipeTabs(CourseListScreen, 1);
const SwipeableDiscussionsScreen = withSwipeTabs(QuestionListScreen, 2);
const SwipeableResourcesScreen = withSwipeTabs(ResourcesHubScreen, 3);
const SwipeableProfileScreen = withSwipeTabs(ProfileScreen, 4);

const getTabIcon = (
  routeName: string
): { filled: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap } => {
  switch (routeName) {
    case 'CoursesTab':
      return { filled: 'book', outline: 'book-outline' };
    case 'DiscussionsTab':
      return { filled: 'chatbubbles', outline: 'chatbubbles-outline' };
    case 'ResourcesTab':
      return { filled: 'folder', outline: 'folder-outline' };
    case 'ProfileTab':
      return { filled: 'person', outline: 'person-outline' };
    case 'FeedTab':
    default:
      return { filled: 'home', outline: 'home-outline' };
  }
};

const CustomWaveTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const windowWidth = Dimensions.get('window').width;
  const initialBarWidth = windowWidth - BAR_MARGIN * 2;
  const [barWidth, setBarWidth] = useState(initialBarWidth);

  const tabWidth = barWidth / state.routes.length;
  const initialX = state.index * tabWidth + (tabWidth - ARCH_WIDTH) / 2;

  const translateX = useRef(new Animated.Value(initialX)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconJumpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (barWidth > 0) {
      const targetX = state.index * tabWidth + (tabWidth - ARCH_WIDTH) / 2;

      iconJumpAnim.setValue(3);

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: targetX,
          friction: 8,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.12,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(iconJumpAnim, {
          toValue: 0,
          friction: 4,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.index, barWidth, tabWidth]);

  const activeRoute = state.routes[state.index];
  const activeIcons = getTabIcon(activeRoute ? activeRoute.name : 'FeedTab');

  return (
    <View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - barWidth) > 1) {
          setBarWidth(w);
        }
      }}
      style={styles.floatingTabBar}
    >
      {/* 1. Base White Floating Bar with Premium Ambient Shadow */}
      <View style={styles.barBackground} />

      {/* 2. Low-Profile Animated Wave Dome (8px rise matching Dribbble reference) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.waveWrapper,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Gentle 8px Gaussian S-Curve Wave Surface */}
        <Svg width={ARCH_WIDTH} height={20} viewBox={`0 0 ${ARCH_WIDTH} 20`}>
          <Path
            d={`M 0 8 C 16 8, 20 0, ${ARCH_WIDTH / 2} 0 C ${ARCH_WIDTH - 20} 0, ${ARCH_WIDTH - 16} 8, ${ARCH_WIDTH} 8 L ${ARCH_WIDTH} 20 L 0 20 Z`}
            fill="#FFFFFF"
          />
        </Svg>

        {/* Soft Pastel Blue Bubble - Grounded & Lowered to match reference */}
        <Animated.View
          style={[
            styles.waveBubble,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ translateY: iconJumpAnim }] }}>
            <Ionicons
              name={activeIcons.filled}
              size={21}
              color={Colors.primary}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* 3. Tab Buttons Row */}
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icons = getTabIcon(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabBtn}
            >
              <View style={styles.iconSlot}>
                {!isFocused && (
                  <Ionicons
                    name={icons.outline}
                    size={22}
                    color="#64748B"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomWaveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="FeedTab" component={SwipeableFeedScreen} />
      <Tab.Screen name="CoursesTab" component={SwipeableCoursesScreen} />
      <Tab.Screen name="DiscussionsTab" component={SwipeableDiscussionsScreen} />
      <Tab.Screen name="ResourcesTab" component={SwipeableResourcesScreen} />
      <Tab.Screen name="ProfileTab" component={SwipeableProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    flex: 1,
  },
  floatingTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: BAR_MARGIN,
    right: BAR_MARGIN,
    height: BAR_HEIGHT,
    overflow: 'visible',
    zIndex: 100,
  },
  barBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
  waveWrapper: {
    position: 'absolute',
    top: -8,
    left: 0,
    width: ARCH_WIDTH,
    height: 48,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  waveBubble: {
    position: 'absolute',
    top: 5,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: '#E0F2FE', // Luminous soft web blue pastel circle
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    zIndex: 20,
  },
  tabBtn: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


