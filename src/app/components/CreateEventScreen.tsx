import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { TouchButton } from './TouchButton';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACTIVITY_TYPES, ActivityType } from '../constants/activityTypes';
import { useLanguage } from '../context/LanguageContext';

export function CreateEventScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0.5]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('other');
  const [loading, setLoading] = useState(false);

  const { translate } = useLanguage();

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y > 150) {
      onNavigate('home');
    }
  };

  const handleCreateEvent = async () => {
    if (!title.trim()) {
      alert('Введите название события');
      return;
    }

    if (!date) {
      alert('Выберите дату');
      return;
    }

    if (!time) {
      alert('Выберите время');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Пользователь не авторизован');
        setLoading(false);
        return;
      }

      const dateTime = new Date(`${date}T${time}`);

      if (Number.isNaN(dateTime.getTime())) {
        alert('Некорректные дата или время');
        setLoading(false);
        return;
      }

      const { data: createdEvent, error } = await supabase
        .from('events')
        .insert([
          {
            title: title.trim(),
            description: description.trim() || null,
            date_time: dateTime.toISOString(),
            location: location.trim() || null,
            activity_type: activityType,
            creator_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Ошибка создания события:', error);
        alert('Не удалось создать событие');
        setLoading(false);
        return;
      }

      onNavigate('event-details', createdEvent);

      const { error: participantError } = await supabase.from('participants').insert([
        {
          user_id: user.id,
          event_id: createdEvent.id,
        },
      ]);

      if (participantError) {
        console.error('Ошибка добавления создателя в participants:', participantError);
        alert('Событие создано, но автор не был добавлен в участники');
        setLoading(false);
        return;
      }

      onNavigate('event-details', createdEvent);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Произошла ошибка при создании события');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.3 }}
      onDragEnd={handleDragEnd}
      style={{ y, opacity }}
      className="h-full flex flex-col bg-background"
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
        <div className="w-10 h-1 rounded-full bg-border"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-5 max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('create.eventTitle')}
            </label>
            <input
              type="text"
              placeholder={translate('create.eventTitlePlaceholder')}
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
              {translate('create.activityType')}
            </label>

            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((type) => {
                const isActive = activityType === type.value;

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
                    <span className="mr-2">{type.emoji}</span>
                    <span>{type.label}</span>
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
              {translate('create.description')}
            </label>
            <textarea
              placeholder={translate('create.descriptionPlaceholder')}
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
                {translate('create.date')}
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
                {translate('create.time')}
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
            <label className="block mb-2 text-sm text-muted-foreground">
              {translate('create.location')}
            </label>
            <input
              type="text"
              placeholder={translate('create.locationPlaceholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
              style={{
                backgroundColor: '#1A1A1A',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 border-t border-border"
      >
        <TouchButton
          onClick={handleCreateEvent}
          variant="primary"
          fullWidth
        >
          {loading ? translate('create.creating') : translate('create.createButton')}
        </TouchButton>
      </motion.div>
    </motion.div>
  );
}