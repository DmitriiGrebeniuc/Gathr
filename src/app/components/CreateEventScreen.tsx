import { motion, useDragControls, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TouchButton } from './TouchButton';
import { ACTIVITY_TYPES, type ActivityType, getActivityTypeMeta } from '../constants/activityTypes';
import { useLanguage } from '../context/LanguageContext';
import { LocationAutocomplete, type LocationValue } from './LocationAutocomplete';
import { EventLocationMap } from './EventLocationMap';
import { getPlanLimits, hasUnlimitedAccess } from '../constants/planLimits';
import { INPUT_LIMITS, limitText, trimAndLimitText } from '../constants/inputLimits';
import { feedback } from '../lib/feedback';
import {
  createEventWithCreator,
  fetchMyProfileAccessSummary,
  upsertEventContactMethods,
} from '../lib/publicData';
import { LoadingLine } from './LoadingState';
import { EventContactMethodsEditor } from './EventContactMethodsSection';
import {
  getEmptyEventContactDraft,
  normalizeEventContactDraft,
  type EventContactValidationField,
} from '../lib/eventContacts';

type MyProfileAccess = {
  id: string;
  name: string | null;
  role: string;
  plan: string;
  has_unlimited_access: boolean;
};

export function CreateEventScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0.5]);
  const dragControls = useDragControls();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState<LocationValue>({
    address: '',
    placeId: null,
    lat: null,
    lng: null,
    city: null,
    cityNormalized: null,
  });
  const [activityType, setActivityType] = useState<ActivityType>('other');
  const [joinMode, setJoinMode] = useState<'open' | 'request'>('open');
  const [contactDraft, setContactDraft] = useState(getEmptyEventContactDraft());
  const [loading, setLoading] = useState(false);
  const [profileAccess, setProfileAccess] = useState<MyProfileAccess | null>(null);
  const [profileAccessResolved, setProfileAccessResolved] = useState(false);

  const { language, translate } = useLanguage();

  const canUseRequestJoinMode =
    profileAccess?.plan === 'pro' || hasUnlimitedAccess(profileAccess?.has_unlimited_access);

  useEffect(() => {
    const loadProfileAccess = async () => {
      try {
        const profileData = (await fetchMyProfileAccessSummary()) as MyProfileAccess | null;
        setProfileAccess(profileData);
      } finally {
        setProfileAccessResolved(true);
      }
    };

    void loadProfileAccess();
  }, []);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y > 150) {
      onNavigate('home');
    }
  };

  const handleMapPick = ({
    lat,
    lng,
    address,
    placeId,
    city,
    cityNormalized,
  }: {
    lat: number;
    lng: number;
    address: string;
    placeId: string | null;
    city: string | null;
    cityNormalized: string | null;
  }) => {
    setLocation({
      address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      placeId,
      lat,
      lng,
      city,
      cityNormalized,
    });
  };

  const handleCreateEvent = async () => {
    const nextTitle = trimAndLimitText(title, INPUT_LIMITS.eventTitle);
    const nextDescription = trimAndLimitText(description, INPUT_LIMITS.eventDescription);
    const nextLocation = trimAndLimitText(location.address, INPUT_LIMITS.eventLocation);

    if (!nextTitle) {
      feedback.warning(translate('create.enterTitle'));
      return;
    }

    if (!date) {
      feedback.warning(translate('create.selectDate'));
      return;
    }

    if (!time) {
      feedback.warning(translate('create.selectTime'));
      return;
    }

    const normalizedContacts = normalizeEventContactDraft(contactDraft);

    if (normalizedContacts.invalidField) {
      const keyByField: Record<EventContactValidationField, string> = {
        instagram: 'eventContacts.invalidInstagram',
        telegram: 'eventContacts.invalidTelegram',
        phone: 'eventContacts.invalidPhone',
      };

      feedback.warning(translate(keyByField[normalizedContacts.invalidField] as any));
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        feedback.error(translate('create.userNotAuthenticated'));
        setLoading(false);
        return;
      }

      const dateTime = new Date(`${date}T${time}`);

      if (Number.isNaN(dateTime.getTime())) {
        feedback.warning(translate('create.invalidDateTime'));
        setLoading(false);
        return;
      }

      if (dateTime.getTime() < Date.now()) {
        feedback.warning(translate('create.pastDateTime'));
        setLoading(false);
        return;
      }

      const profileData = (await fetchMyProfileAccessSummary()) as MyProfileAccess | null;

      if (!profileData) {
        console.error('Failed to load current profile access for create event limits.');
        feedback.error(translate('create.failed'));
        setLoading(false);
        return;
      }

      const isUnlimited = hasUnlimitedAccess(profileData?.has_unlimited_access);
      const limits = getPlanLimits(profileData?.plan);

      if (!isUnlimited) {
        const { data: ownEvents, error: ownEventsError } = await supabase
          .from('events')
          .select('id')
          .eq('creator_id', user.id);

        if (ownEventsError) {
          console.error('Failed to load creator events for active-event limits:', ownEventsError);
          feedback.error(translate('create.failed'));
          setLoading(false);
          return;
        }

        const ownEventIds = ((ownEvents as Array<{ id: string }> | null) || []).map((row) => row.id);
        let activeEventsCount = 0;

        if (ownEventIds.length > 0) {
          const { count: privateDetailsCount, error: activeEventsError } = await supabase
            .from('event_private_details')
            .select('event_id', { count: 'exact', head: true })
            .in('event_id', ownEventIds)
            .gte('date_time', new Date().toISOString());

          if (activeEventsError) {
            console.error('Failed to count active private event details:', activeEventsError);
            feedback.error(translate('create.failed'));
            setLoading(false);
            return;
          }

          activeEventsCount = privateDetailsCount ?? 0;
        }

        if (activeEventsCount >= limits.activeEvents) {
          feedback.warning(
            `${translate('create.activeEventsLimitReached')} ${translate('create.activeEventsLimitReachedPro')}`
          );
          setLoading(false);
          return;
        }
      }

      if (joinMode === 'request' && !canUseRequestJoinMode) {
        feedback.warning(translate('create.requestModeProOnly'));
        setLoading(false);
        return;
      }

      const { data: createdEvent, error } = await createEventWithCreator({
        title: nextTitle,
        description: nextDescription || null,
        dateTime: dateTime.toISOString(),
        location: nextLocation || null,
        locationPlaceId: location.placeId,
        locationLat: location.lat,
        locationLng: location.lng,
        city: location.city,
        cityNormalized: location.cityNormalized,
        activityType,
        visibility: 'public',
        joinMode,
      });

      if (error) {
        console.error('Failed to create event:', error);
        feedback.error(translate('create.failed'));
        setLoading(false);
        return;
      }

      if (!createdEvent) {
        feedback.error(translate('create.failed'));
        setLoading(false);
        return;
      }

      const { error: contactError } = await upsertEventContactMethods(
        createdEvent.id,
        normalizedContacts.data
      );

      if (contactError) {
        console.error('Failed to save event contact methods:', contactError);
        feedback.warning(translate('eventContacts.contactsNotSavedAfterCreate'));
      }

      onNavigate('event-details', createdEvent);
    } catch (error) {
      console.error('Unexpected error:', error);
      feedback.error(translate('create.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.22 }}
      onDragEnd={handleDragEnd}
      style={{ y, opacity }}
      className="relative h-full flex flex-col bg-background overflow-x-hidden"
      dragMomentum={false}
      dragTransition={{ power: 0.08, timeConstant: 140 }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('home')}
          className="text-muted-foreground"
          disabled={loading}
        >
          {translate('create.cancel')}
        </motion.button>
        <h2>{translate('create.title')}</h2>
        <div className="w-14"></div>
      </div>

      <div className="w-full flex justify-center pt-2 pb-1">
        <div
          className="w-10 h-1 rounded-full bg-border cursor-grab active:cursor-grabbing"
          onPointerDown={(event) => dragControls.start(event)}
        ></div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="space-y-5 max-w-sm mx-auto">
          <div>
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('create.eventTitle')}
            </label>
            <input
              type="text"
              placeholder={translate('create.eventTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(limitText(e.target.value, INPUT_LIMITS.eventTitle))}
              maxLength={INPUT_LIMITS.eventTitle}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('create.activityType')}
            </label>

            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((type) => {
                const isActive = activityType === type.value;
                const activityMeta = getActivityTypeMeta(type.value, language);

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setActivityType(type.value)}
                    className="px-3 py-2 rounded-full text-sm border transition-all"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-soft)' : 'var(--card)',
                      borderColor: isActive
                        ? 'var(--accent-border-strong)'
                        : 'var(--border)',
                      color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                    }}
                  >
                    <span className="mr-2">{activityMeta.emoji}</span>
                    <span>{activityMeta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('create.joinModeTitle')}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setJoinMode('open')}
                className="px-4 py-3 rounded-xl border text-left transition-all"
                style={{
                  backgroundColor: joinMode === 'open' ? 'var(--accent-soft)' : 'var(--card)',
                  borderColor:
                    joinMode === 'open' ? 'var(--accent-border-strong)' : 'var(--border)',
                  color: joinMode === 'open' ? 'var(--accent)' : 'var(--foreground-strong)',
                }}
              >
                <p>{translate('create.joinModeOpen')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {translate('create.joinModeOpenDescription')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (canUseRequestJoinMode) {
                    setJoinMode('request');
                  }
                }}
                disabled={!canUseRequestJoinMode}
                className="px-4 py-3 rounded-xl border text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: joinMode === 'request' ? 'var(--accent-soft)' : 'var(--card)',
                  borderColor:
                    joinMode === 'request' ? 'var(--accent-border-strong)' : 'var(--border)',
                  color: joinMode === 'request' ? 'var(--accent)' : 'var(--foreground-strong)',
                }}
                title={!canUseRequestJoinMode ? translate('create.requestModeProOnly') : undefined}
              >
                <p>{translate('create.joinModeRequest')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {translate('create.joinModeRequestDescription')}
                </p>
              </button>
            </div>

            {profileAccessResolved && !canUseRequestJoinMode && (
              <p className="mt-2 text-xs text-muted-foreground">
                {translate('create.requestModeProOnly')}
              </p>
            )}
            {!profileAccessResolved && (
              <div className="mt-3 space-y-2">
                <LoadingLine width="70%" />
                <LoadingLine width="48%" />
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('create.description')}
            </label>
            <textarea
              placeholder={translate('create.descriptionPlaceholder')}
              rows={4}
              value={description}
              onChange={(e) =>
                setDescription(limitText(e.target.value, INPUT_LIMITS.eventDescription))
              }
              maxLength={INPUT_LIMITS.eventDescription}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors resize-none"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            />
          </div>

          <EventContactMethodsEditor
            draft={contactDraft}
            onDraftChange={setContactDraft}
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('create.date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('create.time')}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>
          </div>

          <div>
            <LocationAutocomplete
              label={translate('create.location')}
              placeholder={translate('create.locationPlaceholder')}
              value={location}
              onChange={setLocation}
              disabled={loading}
            />
            <div className="mt-3 -mx-6 sm:mx-0">
              <EventLocationMap
                lat={location.lat}
                lng={location.lng}
                editable
                onPick={handleMapPick}
                height={248}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border">
        <TouchButton onClick={handleCreateEvent} variant="primary" fullWidth disabled={loading}>
          {loading ? translate('create.creating') : translate('create.createButton')}
        </TouchButton>
      </div>
    </motion.div>
  );
}
