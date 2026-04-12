import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { TouchButton } from './TouchButton';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACTIVITY_TYPES, type ActivityType, getActivityTypeMeta } from '../constants/activityTypes';
import { useLanguage } from '../context/LanguageContext';
import { LocationAutocomplete, type LocationValue } from './LocationAutocomplete';
import { EventLocationMap } from './EventLocationMap';
import { feedback } from '../lib/feedback';

export function EditEventScreen({
  onNavigate,
  event,
}: {
  onNavigate: (screen: string, data?: any) => void;
  event?: any;
}) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0.5]);

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
  const [loading, setLoading] = useState(false);

  const { language, translate } = useLanguage();

  useEffect(() => {
    if (!event) return;

    setTitle(event.title || '');
    setDescription(event.description || '');
    setLocation({
      address: event.location || '',
      placeId: event.location_place_id || null,
      lat: typeof event.location_lat === 'number' ? event.location_lat : null,
      lng: typeof event.location_lng === 'number' ? event.location_lng : null,
      city: event.city || null,
      cityNormalized: event.city_normalized || null,
    });
    setActivityType((event.activity_type || 'other') as ActivityType);

    if (event.date_time) {
      const eventDate = new Date(event.date_time);

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

    if (!title.trim()) {
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

      const { data: updatedEvent, error } = await supabase
        .from('events')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          date_time: dateTime.toISOString(),
          location: location.address.trim() || null,
          location_place_id: location.placeId,
          location_lat: location.lat,
          location_lng: location.lng,
          city: location.city,
          city_normalized: location.cityNormalized,
          activity_type: activityType,
        })
        .eq('id', event.id)
        .eq('creator_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Ошибка обновления события:', error);
        feedback.error(translate('edit.failed'));
        setLoading(false);
        return;
      }

      onNavigate('event-details', updatedEvent);
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
        <div className="w-10 h-1 rounded-full bg-border"></div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="space-y-5 max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('edit.eventTitle')}
            </label>
            <input
              type="text"
              placeholder={translate('edit.eventTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
              style={{
                backgroundColor: '#1A1A1A',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
          >
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
                      backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : '#1A1A1A',
                      borderColor: isActive
                        ? 'rgba(212, 175, 55, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: isActive ? '#D4AF37' : '#F5F5F5',
                    }}
                  >
                    <span className="mr-2">{activityMeta.emoji}</span>
                    <span>{activityMeta.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('edit.description')}
            </label>
            <textarea
              placeholder={translate('edit.descriptionPlaceholder')}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors resize-none"
              style={{
                backgroundColor: '#1A1A1A',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
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
                  backgroundColor: '#1A1A1A',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
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
                  backgroundColor: '#1A1A1A',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
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
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 border-t border-border"
      >
        <TouchButton onClick={handleUpdateEvent} variant="primary" fullWidth disabled={loading}>
          {loading ? translate('edit.saving') : translate('edit.saveButton')}
        </TouchButton>
      </motion.div>
    </motion.div>
  );
}
