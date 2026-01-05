---
name: mobile
description: Mobile development with React Native, Flutter, and native patterns
domain: development-stacks
version: 1.0.0
tags: [react-native, flutter, ios, android, expo, mobile-ui]
---

# Mobile Development

## Overview

Cross-platform and native mobile development patterns, frameworks, and best practices.

---

## React Native

### Component Patterns

```tsx
// Functional component with hooks
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserListProps {
  users: User[];
  onSelect: (user: User) => void;
  onRefresh: () => Promise<void>;
}

export function UserList({ users, onSelect, onRefresh }: UserListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const renderItem = useCallback(({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.email}>{item.email}</Text>
    </TouchableOpacity>
  ), [onSelect]);

  const keyExtractor = useCallback((item: User) => item.id, []);

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.empty}>No users found</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  empty: {
    textAlign: 'center',
    padding: 32,
    color: '#999',
  },
});
```

### Navigation

```tsx
// React Navigation setup
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Type-safe navigation
type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

type TabParamList = {
  Feed: undefined;
  Search: undefined;
  Notifications: undefined;
  Account: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = {
            Feed: focused ? 'home' : 'home-outline',
            Search: focused ? 'search' : 'search-outline',
            Notifications: focused ? 'bell' : 'bell-outline',
            Account: focused ? 'person' : 'person-outline',
          }[route.name];

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'User Profile' }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Using navigation in components
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

function ProfileButton({ userId }: { userId: string }) {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  return (
    <Button
      title="View Profile"
      onPress={() => navigation.navigate('Profile', { userId })}
    />
  );
}
```

### State Management

```tsx
// Zustand for React Native
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        const response = await api.login(email, password);
        set({ user: response.user, token: response.token });
      },
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// React Query for data fetching
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => api.getPosts(),
  });
}

function useCreatePost() {
  return useMutation({
    mutationFn: (newPost: CreatePostInput) => api.createPost(newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

### Platform-Specific Code

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

// Platform-specific files
// Button.ios.tsx
// Button.android.tsx
// Import as: import { Button } from './Button';
```

---

## Expo

### Expo Router

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// app/(tabs)/index.tsx
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View>
      <Text>Home Screen</Text>
      <Link href="/profile">Go to Profile</Link>
      <Link href="/modal">Open Modal</Link>
    </View>
  );
}
```

### Native APIs

```tsx
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// Camera
async function takePhoto() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Camera access is needed');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
}

// Location
async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

// Push Notifications
async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

---

## Flutter

### Widget Patterns

```dart
// Stateless widget
class UserCard extends StatelessWidget {
  final User user;
  final VoidCallback onTap;

  const UserCard({
    super.key,
    required this.user,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundImage: NetworkImage(user.avatarUrl),
        ),
        title: Text(user.name),
        subtitle: Text(user.email),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

// Stateful widget with hooks (flutter_hooks)
class CounterPage extends HookWidget {
  @override
  Widget build(BuildContext context) {
    final count = useState(0);
    final controller = useAnimationController(duration: Duration(seconds: 1));

    return Scaffold(
      body: Center(
        child: Text('Count: ${count.value}'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => count.value++,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

### State Management (Riverpod)

```dart
// Provider definitions
final userProvider = FutureProvider<User>((ref) async {
  final repository = ref.watch(userRepositoryProvider);
  return repository.getCurrentUser();
});

final userRepositoryProvider = Provider((ref) {
  return UserRepository(ref.watch(dioProvider));
});

// State notifier
class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void add(CartItem item) {
    state = [...state, item];
  }

  void remove(String id) {
    state = state.where((item) => item.id != id).toList();
  }

  double get total => state.fold(0, (sum, item) => sum + item.price);
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});

// Using providers
class CartPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);

    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return ListTile(
          title: Text(item.name),
          trailing: IconButton(
            icon: const Icon(Icons.delete),
            onPressed: () => notifier.remove(item.id),
          ),
        );
      },
    );
  }
}
```

### Navigation (GoRouter)

```dart
final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
      routes: [
        GoRoute(
          path: 'profile/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return ProfileScreen(userId: id);
          },
        ),
      ],
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
  redirect: (context, state) {
    final isLoggedIn = ref.read(authProvider).isLoggedIn;
    final isLoggingIn = state.matchedLocation == '/login';

    if (!isLoggedIn && !isLoggingIn) {
      return '/login';
    }
    if (isLoggedIn && isLoggingIn) {
      return '/';
    }
    return null;
  },
);

class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
      theme: ThemeData.light(),
      darkTheme: ThemeData.dark(),
    );
  }
}
```

---

## Mobile UI Patterns

### Responsive Design

```tsx
import { useWindowDimensions } from 'react-native';

function ResponsiveLayout({ children }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={isTablet ? styles.tabletContainer : styles.phoneContainer}>
      {children}
    </View>
  );
}

// Safe area handling
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function Screen({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {children}
    </View>
  );
}
```

### Gesture Handling

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function DraggableCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text>Drag me!</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## Related Skills

- [[frontend]] - Web frontend patterns
- [[ux-principles]] - Mobile UX
- [[testing-strategies]] - Mobile testing

