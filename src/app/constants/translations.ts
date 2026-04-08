import type { LanguageCode } from './languages';

type TranslationKey =
  | 'profile.title'
  | 'profile.editProfile'
  | 'profile.notificationSettings'
  | 'profile.language'
  | 'profile.privacySecurity'
  | 'profile.helpSupport'
  | 'profile.logout'
  | 'profile.loggingOut'
  | 'profile.loading'
  | 'profile.loadingEmail'
  | 'profile.noEmail'
  | 'language.title'
  | 'language.selectedLanguage'
  | 'language.back'
  | 'home.discover'
  | 'home.joined'
  | 'home.myEvents'
  | 'home.all'
  | 'home.loadMore'
  | 'home.loading'
  | 'home.createdBy'
  | 'home.you'
  | 'home.participant'
  | 'home.participants'
  | 'home.past'
  | 'home.noMyEvents'
  | 'home.noJoinedEvents'
  | 'home.noDiscoverEvents'
  | 'home.noEventsForFilter'
  | 'home.createFirstEvent'
  | 'home.joinedWillAppear'
  | 'home.noEventsFromOthers';

const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  en: {
    'profile.title': 'Profile',
    'profile.editProfile': 'Edit Profile',
    'profile.notificationSettings': 'Notification Settings',
    'profile.language': 'Language',
    'profile.privacySecurity': 'Privacy & Security',
    'profile.helpSupport': 'Help & Support',
    'profile.logout': 'Log Out',
    'profile.loggingOut': 'Logging out...',
    'profile.loading': 'Loading...',
    'profile.loadingEmail': 'Loading email...',
    'profile.noEmail': 'No email',

    'language.title': 'Language',
    'language.selectedLanguage': 'Selected language',
    'language.back': 'Back',

    'home.discover': 'Discover',
    'home.joined': 'Joined',
    'home.myEvents': 'My Events',
    'home.all': 'All',
    'home.loadMore': 'Load more',
    'home.loading': 'Loading...',
    'home.createdBy': 'Created by',
    'home.you': 'You',
    'home.participant': 'participant',
    'home.participants': 'participants',
    'home.past': 'Past',
    'home.noMyEvents': 'No my events yet',
    'home.noJoinedEvents': 'No joined events yet',
    'home.noDiscoverEvents': 'No discover events yet',
    'home.noEventsForFilter': 'No events found for this activity type.',
    'home.createFirstEvent': 'Create your first event by tapping the + button.',
    'home.joinedWillAppear': 'Events you join will appear here.',
    'home.noEventsFromOthers': 'There are no events from other users yet.',
  },

  ru: {
    'profile.title': 'Профиль',
    'profile.editProfile': 'Редактировать профиль',
    'profile.notificationSettings': 'Настройки уведомлений',
    'profile.language': 'Язык',
    'profile.privacySecurity': 'Конфиденциальность и безопасность',
    'profile.helpSupport': 'Помощь и поддержка',
    'profile.logout': 'Выйти',
    'profile.loggingOut': 'Выход...',
    'profile.loading': 'Загрузка...',
    'profile.loadingEmail': 'Загрузка email...',
    'profile.noEmail': 'Нет email',

    'language.title': 'Язык',
    'language.selectedLanguage': 'Выбранный язык',
    'language.back': 'Назад',

    'home.discover': 'События',
    'home.joined': 'Участвую',
    'home.myEvents': 'Мои события',
    'home.all': 'Все',
    'home.loadMore': 'Загрузить еще',
    'home.loading': 'Загрузка...',
    'home.createdBy': 'Создал',
    'home.you': 'Ты',
    'home.participant': 'участник',
    'home.participants': 'участников',
    'home.past': 'Прошло',
    'home.noMyEvents': 'У тебя пока нет событий',
    'home.noJoinedEvents': 'Ты пока никуда не присоединился',
    'home.noDiscoverEvents': 'Событий пока нет',
    'home.noEventsForFilter': 'По этому типу активности событий не найдено.',
    'home.createFirstEvent': 'Создай свое первое событие через кнопку +.',
    'home.joinedWillAppear': 'События, к которым ты присоединишься, появятся здесь.',
    'home.noEventsFromOthers': 'Пока нет событий от других пользователей.',
  },

  ro: {
    'profile.title': 'Profil',
    'profile.editProfile': 'Editează profilul',
    'profile.notificationSettings': 'Setări notificări',
    'profile.language': 'Limbă',
    'profile.privacySecurity': 'Confidențialitate și securitate',
    'profile.helpSupport': 'Ajutor și suport',
    'profile.logout': 'Deconectare',
    'profile.loggingOut': 'Se închide sesiunea...',
    'profile.loading': 'Se încarcă...',
    'profile.loadingEmail': 'Se încarcă emailul...',
    'profile.noEmail': 'Fără email',

    'language.title': 'Limbă',
    'language.selectedLanguage': 'Limba selectată',
    'language.back': 'Înapoi',

    'home.discover': 'Descoperă',
    'home.joined': 'Particip',
    'home.myEvents': 'Evenimentele mele',
    'home.all': 'Toate',
    'home.loadMore': 'Încarcă mai mult',
    'home.loading': 'Se încarcă...',
    'home.createdBy': 'Creat de',
    'home.you': 'Tu',
    'home.participant': 'participant',
    'home.participants': 'participanți',
    'home.past': 'Trecut',
    'home.noMyEvents': 'Nu ai încă evenimente',
    'home.noJoinedEvents': 'Nu ai participări încă',
    'home.noDiscoverEvents': 'Nu există evenimente momentan',
    'home.noEventsForFilter': 'Nu au fost găsite evenimente pentru acest tip de activitate.',
    'home.createFirstEvent': 'Creează primul tău eveniment folosind butonul +.',
    'home.joinedWillAppear': 'Evenimentele la care participi vor apărea aici.',
    'home.noEventsFromOthers': 'Încă nu există evenimente de la alți utilizatori.',
  },

  uk: {
    'profile.title': 'Профіль',
    'profile.editProfile': 'Редагувати профіль',
    'profile.notificationSettings': 'Налаштування сповіщень',
    'profile.language': 'Мова',
    'profile.privacySecurity': 'Конфіденційність і безпека',
    'profile.helpSupport': 'Допомога та підтримка',
    'profile.logout': 'Вийти',
    'profile.loggingOut': 'Вихід...',
    'profile.loading': 'Завантаження...',
    'profile.loadingEmail': 'Завантаження email...',
    'profile.noEmail': 'Немає email',

    'language.title': 'Мова',
    'language.selectedLanguage': 'Обрана мова',
    'language.back': 'Назад',

    'home.discover': 'Події',
    'home.joined': 'Беру участь',
    'home.myEvents': 'Мої події',
    'home.all': 'Усі',
    'home.loadMore': 'Завантажити ще',
    'home.loading': 'Завантаження...',
    'home.createdBy': 'Створив',
    'home.you': 'Ти',
    'home.participant': 'учасник',
    'home.participants': 'учасників',
    'home.past': 'Минуло',
    'home.noMyEvents': 'У тебе поки немає подій',
    'home.noJoinedEvents': 'Ти поки ні до чого не приєднався',
    'home.noDiscoverEvents': 'Подій поки немає',
    'home.noEventsForFilter': 'Для цього типу активності подій не знайдено.',
    'home.createFirstEvent': 'Створи свою першу подію через кнопку +.',
    'home.joinedWillAppear': 'Події, до яких ти приєднаєшся, зʼявляться тут.',
    'home.noEventsFromOthers': 'Поки немає подій від інших користувачів.',
  },

  de: {
    'profile.title': 'Profil',
    'profile.editProfile': 'Profil bearbeiten',
    'profile.notificationSettings': 'Benachrichtigungseinstellungen',
    'profile.language': 'Sprache',
    'profile.privacySecurity': 'Datenschutz und Sicherheit',
    'profile.helpSupport': 'Hilfe und Support',
    'profile.logout': 'Abmelden',
    'profile.loggingOut': 'Abmeldung...',
    'profile.loading': 'Wird geladen...',
    'profile.loadingEmail': 'E-Mail wird geladen...',
    'profile.noEmail': 'Keine E-Mail',

    'language.title': 'Sprache',
    'language.selectedLanguage': 'Ausgewählte Sprache',
    'language.back': 'Zurück',

    'home.discover': 'Entdecken',
    'home.joined': 'Beigetreten',
    'home.myEvents': 'Meine Events',
    'home.all': 'Alle',
    'home.loadMore': 'Mehr laden',
    'home.loading': 'Wird geladen...',
    'home.createdBy': 'Erstellt von',
    'home.you': 'Du',
    'home.participant': 'Teilnehmer',
    'home.participants': 'Teilnehmer',
    'home.past': 'Vergangen',
    'home.noMyEvents': 'Du hast noch keine Events',
    'home.noJoinedEvents': 'Du bist noch keinem Event beigetreten',
    'home.noDiscoverEvents': 'Noch keine Events vorhanden',
    'home.noEventsForFilter': 'Für diesen Aktivitätstyp wurden keine Events gefunden.',
    'home.createFirstEvent': 'Erstelle dein erstes Event mit der + Taste.',
    'home.joinedWillAppear': 'Events, denen du beitrittst, erscheinen hier.',
    'home.noEventsFromOthers': 'Es gibt noch keine Events von anderen Nutzern.',
  },
};

export const t = (language: LanguageCode, key: TranslationKey) => {
  return translations[language][key] || translations.en[key] || key;
};