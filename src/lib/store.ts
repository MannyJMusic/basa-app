import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// User state interface
interface UserState {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isVerified: boolean
  } | null
  isAuthenticated: boolean
  isLoading: boolean
}

// UI state interface
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>
}

// Event state interface
interface EventState {
  selectedEvent: any | null
  eventFilters: {
    category: string[]
    dateRange: { start: Date | null; end: Date | null }
    location: string[]
    priceRange: { min: number; max: number }
  }
  savedEvents: string[]
}

// Combined state interface
interface AppState extends UserState, UIState, EventState {
  // User actions
  setUser: (user: UserState['user']) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
  
  // UI actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Event actions
  setSelectedEvent: (event: any | null) => void
  setEventFilters: (filters: Partial<EventState['eventFilters']>) => void
  toggleSavedEvent: (eventId: string) => void
  clearEventFilters: () => void
}

// Create the store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sidebarOpen: false,
      theme: 'system',
      notifications: [],
      selectedEvent: null,
      eventFilters: {
        category: [],
        dateRange: { start: null, end: null },
        location: [],
        priceRange: { min: 0, max: 1000 }
      },
      savedEvents: [],

      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        selectedEvent: null,
        savedEvents: []
      }),

      // UI actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = { ...notification, id }
        set((state) => ({ 
          notifications: [...state.notifications, newNotification] 
        }))
        
        // Auto-remove notification after duration (default: 5000ms)
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, notification.duration || 5000)
        }
      },
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Event actions
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      setEventFilters: (filters) => set((state) => ({
        eventFilters: { ...state.eventFilters, ...filters }
      })),
      toggleSavedEvent: (eventId) => set((state) => {
        const savedEvents = state.savedEvents.includes(eventId)
          ? state.savedEvents.filter(id => id !== eventId)
          : [...state.savedEvents, eventId]
        return { savedEvents }
      }),
      clearEventFilters: () => set({
        eventFilters: {
          category: [],
          dateRange: { start: null, end: null },
          location: [],
          priceRange: { min: 0, max: 1000 }
        }
      })
    }),
    {
      name: 'basa-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        savedEvents: state.savedEvents,
        eventFilters: state.eventFilters
      })
    }
  )
)

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setLoading: state.setLoading,
  logout: state.logout
}))

export const useUI = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  theme: state.theme,
  notifications: state.notifications,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setTheme: state.setTheme,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications
}))

export const useEvents = () => useAppStore((state) => ({
  selectedEvent: state.selectedEvent,
  eventFilters: state.eventFilters,
  savedEvents: state.savedEvents,
  setSelectedEvent: state.setSelectedEvent,
  setEventFilters: state.setEventFilters,
  toggleSavedEvent: state.toggleSavedEvent,
  clearEventFilters: state.clearEventFilters
})) 