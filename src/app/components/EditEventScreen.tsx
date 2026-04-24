import { motion, useDragControls, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { TouchButton } from './TouchButton';
import { supabase } from '../../lib/supabase';
import { ACTIVITY_TYPES, type ActivityType, getActivityTypeMeta } from '../constants/activityTypes';
import { useLanguage } from '../context/LanguageContext';
import { LocationAutocomplete, type LocationValue } from './LocationAutocomplete';
import { EventLocationMap } from './EventLocationMap';
import { INPUT_LIMITS, limitText, trimAndLimitText } from '../constants/inputLimits';
import { feedback } from '../lib/feedback';
import {
  fetchEventPrivateDetails,
  fetchMyProfileAccessSummary,
  updateEventWithCreator,
} from '../lib/publicData';
import { hasUnlimitedAccess } from '../constants/planLimits';
import { LoadingCard, LoadingLine } from './LoadingState';

export function EditEventScreen({
  onNavigate,
  event,
}: {
  onNavigate: (screen: string, data?: any) => void;
  event?: any;
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
  const [loading, setLoading] = useState(false);
  const [canUseRequestJoinMode, setCanUseRequestJoinMode] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const hydrationRequestRef = useRef(0);

  const { language, translate } = useLanguage();

  useEffect(() => {
    const loadEventState = async () => {
      if (!event) {
        setInitializing(false);
        return;
      }

      const requestId = ++hydrationRequestRef.current;
      setInitializing(true);

      try {
        const [privateDetails, myAccess] = await Promise.all([
          fetchEventPrivateDetails(event.id),
          fetchMyProfileAccessSummary(),
        ]);

        if (requestId !== hydrationRequestRef.current) {
          return;
        }

        setTitle(event.title || '');
        setDescription(event.description || '');
        setActivityType((event.activity_type || 'other') as ActivityType);
        setJoinMode((event.join_mode || 'open') as 'open' | 'request');
        setCanUseRequestJoinMode(
          myAccess?.plan === 'pro' || hasUnlimitedAccess(myAccess?.has_unlimited_access)
        );

        const sourceDateTime = privateDetails?.date_time || event.date_time || null;

        setLocation({
          address: privateDetails?.location || event.location || '',
          placeId: privateDetails?.location_place_id || event.location_place_id || null,
          lat:
            typeof privateDetails?.location_lat === 'number'
              ? privateDetails.location_lat
              : typeof event.location_lat === 'number'
                ? event.location_lat
                : null,
          lng:
            typeof privateDetails?.location_lng === 'number'
              ? privateDetails.location_lng
              : typeof event.location_lng === 'number'
                ? event.location_lng
                : null,
          city: event.city || null,
          cityNormalized: event.city_normalized || null,
        });

        if (sourceDateTime) {
          const eventDate = new Date(sourceDateTime);

          if (!Number.isNaN(eventDate.getTime())) {
            const year = eventDate.getFullYear();
            const month = String(eventDate.getMonth() + 1).padStart(2, '0');
            const day = String(eventDate.getDate()).padStart(2, '0');
            const hours = String(eventDate.getHours()).padStart(2, '0');
            const minutes = String(eventDate.getMinutes()).padStart(2, '0');

            setDate(`${year}-${month}-${day}`);
            setTime(`${hours}:${minutes}`);
          }
        }
      } finally {
        if (requestId === hydrationRequestRef.current) {
          setInitializing(false);
        }
      }
    };

    void loadEventState();
  }, [event]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y > 150) {
      onNavigate('event-details', event);
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

  const handleUpdateEvent = async () => {
    if (!event?.id) {
      feedback.error(translate('edit.eventNotFound'));
      return;
    }

    const nextTitle = trimAndLimitText(title, INPUT_LIMITS.eventTitle);
    const nextDescription = trimAndLimitText(description, INPUT_LIMITS.eventDescription);
    const nextLocation = trimAndLimitText(location.address, INPUT_LIMITS.eventLocation);

    if (!nextTitle) {
      feedback.warning(translate('edit.enterTitle'));
      return;
    }

    if (!date) {
      feedback.warning(translate('edit.selectDate'));
      return;
    }

    if (!time) {
      feedback.warning(translate('edit.selectTime'));
      return;
    }

    if (joinMode === 'request' && !canUseRequestJoinMode) {
      feedback.warning(translate('edit.requestModeProOnly'));
      return;
    }

    setLoading(true);

    try {
      const dateTime = new Date(`${date}T${time}`);

      if (Number.isNaN(dateTime.getTime())) {
        feedback.warning(translate('edit.invalidDateTime'));
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        feedback.error(translate('edit.userNotAuthenticated'));
        setLoading(false);
        return;
      }

      const { data: updatedEvent, error } = await updateEventWithCreator({
        eventId: event.id,
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
        visibility: (event.visibility || 'public') as 'public' | 'private',
        joinMode,
      });

      if (error) {
        console.error('Failed to update event:', error);
        feedback.error(translate('edit.failed'));
        setLoading(false);
        return;
      }

      onNavigate('event-details', updatedEvent || event);
    } catch (error) {
      console.error('Unexpected update error:', error);
      feedback.error(translate('edit.unexpectedError'));
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
      className="h-full flex flex-col bg-background overflow-x-hidden"
      dragMomentum={false}
      dragTransition={{ power: 0.08, timeConstant: 140 }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('event-details', event)}
          className="text-muted-foreground"
          disabled={loading}
        >
          {translate('edit.cancel')}
        </motion.button>
        <h2>{translate('edit.title')}</h2>
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
          {initializing ? (
            <>
              <LoadingCard lines={['32%', '100%']} />
              <LoadingCard lines={['28%', '70%', '68%']} />
              <div className="grid grid-cols-2 gap-3">
                <LoadingCard lines={['56%', '100%']} />
                <LoadingCard lines={['56%', '100%']} />
              </div>
              <LoadingCard className="min-h-[17rem]" lines={['40%', '100%', '100%', '86%']} />
            </>
          ) : (
            <>
          <div>
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('edit.eventTitle')}
            </label>
            <input
              type="text"
              placeholder={translate('edit.eventTitlePlaceholder')}
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
              {translate('edit.activityType')}
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
              {translate('edit.joinModeTitle')}
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
                <p>{translate('edit.joinModeOpen')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {translate('edit.joinModeOpenDescription')}
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
                title={!canUseRequestJoinMode ? translate('edit.requestModeProOnly') : undefined}
              >
                <p>{translate('edit.joinModeRequest')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {translate('edit.joinModeRequestDescription')}
                </p>
              </button>
            </div>

            {!canUseRequestJoinMode && (
              <p className="mt-2 text-xs text-muted-foreground">
                {translate('edit.requestModeProOnly')}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('edit.description')}
            </label>
            <textarea
              placeholder={translate('edit.descriptionPlaceholder')}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('edit.date')}
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
                {translate('edit.time')}
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
              label={translate('edit.location')}
              placeholder={translate('edit.locationPlaceholder')}
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
            </>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-border">
        <TouchButton
          onClick={handleUpdateEvent}
          variant="primary"
          fullWidth
          disabled={loading || initializing}
        >
          {loading ? translate('edit.saving') : translate('edit.saveButton')}
        </TouchButton>
        {initializing && (
          <div className="mt-3">
            <LoadingLine width="45%" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
