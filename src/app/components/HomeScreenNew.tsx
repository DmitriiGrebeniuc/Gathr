'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { getActivityTypeMeta, ACTIVITY_TYPES } from '../constants/activityTypes';
import { PullToRefresh } from './PullToRefresh';

// Types
interface Event {
  id: string;
  title: string;
  description?: string;
  activity_type: string;
  event_date: string;
  location?: string;
  city?: string;
  image_url?: string;
  creator_id: string;
  creatorName?: string;
  participantCount: number;
  join_mode?: string;
}

interface HomeScreenNewProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void;
}

type TabKey = 'discover' | 'joined' | 'my' | 'visited';

export function HomeScreenNew({ onNavigate }: HomeScreenNewProps) {
  const { language, translate } = useLanguage();
  
  // Core state
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(new Set());
  
  // Filter state
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // City options
  const [cityOptions, setCityOptions] = useState<{ city: string; cityNormalized: string }[]>([]);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          activity_type,
          event_date,
          location,
          city,
          image_url,
          creator_id,
          join_mode,
          profiles:creator_id (name)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Get participant counts
      const { data: participantCounts } = await supabase
        .from('participants')
        .select('event_id');

      const countMap = new Map<string, number>();
      participantCounts?.forEach((p) => {
        const count = countMap.get(p.event_id) || 0;
        countMap.set(p.event_id, count + 1);
      });

      // Get joined events for current user
      if (currentUserId) {
        const { data: joined } = await supabase
          .from('participants')
          .select('event_id')
          .eq('user_id', currentUserId);
        
        setJoinedEventIds(new Set(joined?.map(j => j.event_id) || []));
      }

      const formattedEvents: Event[] = (eventsData || []).map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        activity_type: e.activity_type,
        event_date: e.event_date,
        location: e.location,
        city: e.city,
        image_url: e.image_url,
        creator_id: e.creator_id,
        creatorName: (e.profiles as { name?: string } | null)?.name || undefined,
        participantCount: countMap.get(e.id) || 0,
        join_mode: e.join_mode,
      }));

      setEvents(formattedEvents);

      // Extract unique cities
      const cities = new Map<string, string>();
      formattedEvents.forEach((e) => {
        if (e.city) {
          const normalized = e.city.toLowerCase().trim();
          if (!cities.has(normalized)) {
            cities.set(normalized, e.city);
          }
        }
      });
      setCityOptions(
        Array.from(cities.entries()).map(([normalized, original]) => ({
          city: original,
          cityNormalized: normalized,
        }))
      );
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    const now = new Date();
    
    return events.filter((event) => {
      const eventDate = new Date(event.event_date);
      const isPast = eventDate < now;
      
      // Tab filtering
      if (activeTab === 'discover' && isPast) return false;
      if (activeTab === 'joined' && !joinedEventIds.has(event.id)) return false;
      if (activeTab === 'my' && event.creator_id !== currentUserId) return false;
      if (activeTab === 'visited' && (!isPast || !joinedEventIds.has(event.id))) return false;
      
      // Activity filter
      if (selectedActivity !== 'all' && event.activity_type !== selectedActivity) return false;
      
      // City filter
      if (selectedCity !== 'all') {
        const eventCityNorm = event.city?.toLowerCase().trim();
        if (eventCityNorm !== selectedCity) return false;
      }
      
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesLocation = event.location?.toLowerCase().includes(q);
        const matchesCity = event.city?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesCity) return false;
      }
      
      return true;
    });
  }, [events, activeTab, selectedActivity, selectedCity, searchQuery, joinedEventIds, currentUserId]);

  // Split into featured and rest
  const featuredEvent = filteredEvents[0];
  const upcomingEvents = filteredEvents.slice(1, 6);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', options);
  };

  // Active filter count
  const activeFilterCount = [
    selectedActivity !== 'all',
    selectedCity !== 'all',
    searchQuery.length > 0,
  ].filter(Boolean).length;

  // Tabs
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'discover', label: translate('home.discover') },
    { key: 'joined', label: translate('home.joined') },
    { key: 'my', label: translate('home.myEvents') },
    { key: 'visited', label: translate('home.visited') },
  ];

  const handleRefresh = async () => {
    await fetchEvents();
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Minimal Header */}
      <header 
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <h1 
          className="text-lg font-medium tracking-tight"
          style={{ color: 'var(--accent)' }}
        >
          Gathr
        </h1>
        
        <button
          onClick={() => onNavigate('profile')}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ 
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
            {currentUserId ? 'U' : '?'}
          </span>
        </button>
      </header>

      {/* Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="flex-1 overflow-y-auto">
          {/* Filter Pill */}
          <div className="px-5 py-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all"
              style={{
                backgroundColor: activeFilterCount > 0 
                  ? 'rgba(212, 175, 55, 0.1)' 
                  : 'rgba(255,255,255,0.04)',
                border: activeFilterCount > 0 
                  ? '1px solid rgba(212, 175, 55, 0.25)' 
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <SlidersHorizontal 
                size={14} 
                style={{ color: activeFilterCount > 0 ? 'var(--accent)' : 'var(--muted-foreground)' }} 
              />
              <span 
                className="text-xs"
                style={{ color: activeFilterCount > 0 ? 'var(--accent)' : 'var(--muted-foreground)' }}
              >
                {activeFilterCount > 0 ? `${activeFilterCount} active` : 'Filters'}
              </span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div 
                className="h-6 w-6 animate-spin rounded-full border-2"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : (
            <div className="px-5 pb-24 space-y-6">
              {/* Featured Event - Hero Card */}
              {featuredEvent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => onNavigate('event-details', { eventId: featuredEvent.id })}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{ 
                    aspectRatio: '4/5',
                    maxHeight: '60vh',
                  }}
                >
                  {/* Background */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundColor: 'rgba(30, 30, 30, 1)',
                      backgroundImage: featuredEvent.image_url 
                        ? `url(${featuredEvent.image_url})` 
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
                    }}
                  />
                  
                  {/* Activity badge */}
                  <div className="absolute top-4 left-4">
                    <span 
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        color: 'var(--accent)',
                      }}
                    >
                      <span>{getActivityTypeMeta(featuredEvent.activity_type, language).emoji}</span>
                      <span>{getActivityTypeMeta(featuredEvent.activity_type, language).label}</span>
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 
                      className="text-2xl font-semibold mb-3 leading-tight"
                      style={{ color: '#fff' }}
                    >
                      {featuredEvent.title}
                    </h2>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: 'var(--accent)' }} />
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {formatDate(featuredEvent.event_date)}
                        </span>
                      </div>
                      
                      {featuredEvent.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} style={{ color: 'var(--accent)' }} />
                          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {featuredEvent.location}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Users size={14} style={{ color: 'var(--accent)' }} />
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {featuredEvent.participantCount} {featuredEvent.participantCount === 1 ? 'person' : 'people'} going
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        by {featuredEvent.creatorName || 'Unknown'}
                      </span>
                      
                      <div 
                        className="flex items-center gap-1 text-xs"
                        style={{ color: 'var(--accent)' }}
                      >
                        <span>View</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Upcoming Events - Horizontal Scroll */}
              {upcomingEvents.length > 0 && (
                <div>
                  <h3 
                    className="text-xs font-medium uppercase tracking-wider mb-3"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {translate('home.upcomingEvents')}
                  </h3>
                  
                  <div 
                    className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {upcomingEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => onNavigate('event-details', { eventId: event.id })}
                        className="shrink-0 w-64 rounded-xl overflow-hidden cursor-pointer"
                        style={{ 
                          scrollSnapAlign: 'start',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {/* Image area */}
                        <div 
                          className="h-32 relative"
                          style={{
                            backgroundColor: 'rgba(40, 40, 40, 1)',
                            backgroundImage: event.image_url 
                              ? `url(${event.image_url})` 
                              : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                            }}
                          />
                          <span 
                            className="absolute bottom-2 left-2 text-lg"
                          >
                            {getActivityTypeMeta(event.activity_type, language).emoji}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <div className="p-3">
                          <h4 
                            className="text-sm font-medium truncate mb-1"
                            style={{ color: 'var(--foreground-strong)' }}
                          >
                            {event.title}
                          </h4>
                          <p 
                            className="text-xs mb-2"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {formatDate(event.event_date)}
                          </p>
                          <div className="flex items-center justify-between">
                            <span 
                              className="text-[11px]"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              {event.participantCount} going
                            </span>
                            {joinedEventIds.has(event.id) && (
                              <span 
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ 
                                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                  color: 'var(--accent)',
                                }}
                              >
                                Joined
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!featuredEvent && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                  >
                    <Calendar size={24} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3 
                    className="text-lg font-medium mb-2"
                    style={{ color: 'var(--foreground-strong)' }}
                  >
                    {translate('home.noEventsTitle')}
                  </h3>
                  <p 
                    className="text-sm max-w-xs"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {translate('home.noEventsDescription')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Bottom Navigation - 3 items only */}
      <nav 
        className="flex items-center justify-around py-3"
        style={{ 
          backgroundColor: 'rgba(10, 10, 10, 0.98)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center gap-1 px-6 py-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ color: 'var(--accent)' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        <button
          onClick={() => onNavigate('create-event')}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center gap-1 px-6 py-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ color: 'var(--muted-foreground)' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </nav>

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            />
            
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
              style={{ 
                backgroundColor: '#121212',
                maxHeight: '85vh',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div 
                  className="w-10 h-1 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4">
                <h3 
                  className="text-base font-medium"
                  style={{ color: 'var(--foreground-strong)' }}
                >
                  Filters
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1"
                >
                  <X size={20} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
              
              <div className="px-5 pb-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
                {/* Tabs */}
                <div>
                  <label 
                    className="text-xs uppercase tracking-wider mb-3 block"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    View
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="px-3 py-1.5 rounded-full text-xs transition-all"
                        style={{
                          backgroundColor: activeTab === tab.key 
                            ? 'rgba(212, 175, 55, 0.12)' 
                            : 'rgba(255,255,255,0.04)',
                          color: activeTab === tab.key 
                            ? 'var(--accent)' 
                            : 'var(--muted-foreground)',
                          border: activeTab === tab.key 
                            ? '1px solid rgba(212, 175, 55, 0.25)' 
                            : '1px solid transparent',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Search */}
                <div>
                  <label 
                    className="text-xs uppercase tracking-wider mb-3 block"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Search
                  </label>
                  <div 
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={translate('home.searchPlaceholder')}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: 'var(--foreground-strong)' }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')}>
                        <X size={14} style={{ color: 'var(--muted-foreground)' }} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Activity Type */}
                <div>
                  <label 
                    className="text-xs uppercase tracking-wider mb-3 block"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Activity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedActivity('all')}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        backgroundColor: selectedActivity === 'all' 
                          ? 'rgba(212, 175, 55, 0.12)' 
                          : 'rgba(255,255,255,0.04)',
                        color: selectedActivity === 'all' 
                          ? 'var(--accent)' 
                          : 'var(--muted-foreground)',
                        border: selectedActivity === 'all' 
                          ? '1px solid rgba(212, 175, 55, 0.25)' 
                          : '1px solid transparent',
                      }}
                    >
                      All
                    </button>
                    {ACTIVITY_TYPES.map((type) => {
                      const meta = getActivityTypeMeta(type.value, language);
                      const isActive = selectedActivity === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setSelectedActivity(type.value)}
                          className="px-3 py-1.5 rounded-full text-xs transition-all"
                          style={{
                            backgroundColor: isActive 
                              ? 'rgba(212, 175, 55, 0.12)' 
                              : 'rgba(255,255,255,0.04)',
                            color: isActive 
                              ? 'var(--accent)' 
                              : 'var(--muted-foreground)',
                            border: isActive 
                              ? '1px solid rgba(212, 175, 55, 0.25)' 
                              : '1px solid transparent',
                          }}
                        >
                          {meta.emoji} {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* City */}
                <div>
                  <label 
                    className="text-xs uppercase tracking-wider mb-3 block"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    City
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCity('all')}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        backgroundColor: selectedCity === 'all' 
                          ? 'rgba(212, 175, 55, 0.12)' 
                          : 'rgba(255,255,255,0.04)',
                        color: selectedCity === 'all' 
                          ? 'var(--accent)' 
                          : 'var(--muted-foreground)',
                        border: selectedCity === 'all' 
                          ? '1px solid rgba(212, 175, 55, 0.25)' 
                          : '1px solid transparent',
                      }}
                    >
                      All Cities
                    </button>
                    {cityOptions.map((city) => {
                      const isActive = selectedCity === city.cityNormalized;
                      return (
                        <button
                          key={city.cityNormalized}
                          onClick={() => setSelectedCity(city.cityNormalized)}
                          className="px-3 py-1.5 rounded-full text-xs transition-all"
                          style={{
                            backgroundColor: isActive 
                              ? 'rgba(212, 175, 55, 0.12)' 
                              : 'rgba(255,255,255,0.04)',
                            color: isActive 
                              ? 'var(--accent)' 
                              : 'var(--muted-foreground)',
                            border: isActive 
                              ? '1px solid rgba(212, 175, 55, 0.25)' 
                              : '1px solid transparent',
                          }}
                        >
                          {city.city}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedActivity('all');
                      setSelectedCity('all');
                      setSearchQuery('');
                    }}
                    className="w-full py-2.5 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              
              {/* Apply button */}
              <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                  }}
                >
                  Show {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
