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
  | 'home.noEventsFromOthers'
  | 'create.title'
  | 'create.cancel'
  | 'create.eventTitle'
  | 'create.eventTitlePlaceholder'
  | 'create.activityType'
  | 'create.description'
  | 'create.descriptionPlaceholder'
  | 'create.date'
  | 'create.time'
  | 'create.location'
  | 'create.locationPlaceholder'
  | 'create.createButton'
  | 'create.creating'
  | 'edit.title'
  | 'edit.cancel'
  | 'edit.eventTitle'
  | 'edit.eventTitlePlaceholder'
  | 'edit.activityType'
  | 'edit.description'
  | 'edit.descriptionPlaceholder'
  | 'edit.date'
  | 'edit.time'
  | 'edit.location'
  | 'edit.locationPlaceholder'
  | 'edit.saveButton'
  | 'edit.saving'
  | 'details.back'
  | 'details.pastEvent'
  | 'details.noDescription'
  | 'details.dateTime'
  | 'details.location'
  | 'details.locationNotSpecified'
  | 'details.participants'
  | 'details.noParticipants'
  | 'details.you'
  | 'details.creator'
  | 'details.leaveEvent'
  | 'details.leaving'
  | 'details.joinEvent'
  | 'details.joining'
  | 'details.eventEnded'
  | 'details.editEvent'
  | 'details.deleteEvent'
  | 'details.deleting'
  | 'participants.back'
  | 'participants.title'
  | 'participants.loading'
  | 'participants.noParticipants'
  | 'participants.eventFallback'
  | 'participants.participant'
  | 'participants.participants'
  | 'participants.you'
  | 'participants.creator';

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

    'create.title': 'Create Event',
    'create.cancel': 'Cancel',
    'create.eventTitle': 'Event Title',
    'create.eventTitlePlaceholder': 'What are you planning?',
    'create.activityType': 'Activity Type',
    'create.description': 'Description',
    'create.descriptionPlaceholder': 'Add details about your event...',
    'create.date': 'Date',
    'create.time': 'Time',
    'create.location': 'Location',
    'create.locationPlaceholder': 'Where will it happen?',
    'create.createButton': 'Create Event',
    'create.creating': 'Creating...',

    'edit.title': 'Edit Event',
    'edit.cancel': 'Cancel',
    'edit.eventTitle': 'Event Title',
    'edit.eventTitlePlaceholder': 'What are you planning?',
    'edit.activityType': 'Activity Type',
    'edit.description': 'Description',
    'edit.descriptionPlaceholder': 'Add details about your event...',
    'edit.date': 'Date',
    'edit.time': 'Time',
    'edit.location': 'Location',
    'edit.locationPlaceholder': 'Where will it happen?',
    'edit.saveButton': 'Save Changes',
    'edit.saving': 'Saving...',

    'details.back': 'Back',
    'details.pastEvent': 'Past event',
    'details.noDescription': 'No description provided',
    'details.dateTime': 'Date & Time',
    'details.location': 'Location',
    'details.locationNotSpecified': 'Location not specified',
    'details.participants': 'Participants',
    'details.noParticipants': 'No participants yet',
    'details.you': 'You',
    'details.creator': 'Creator',
    'details.leaveEvent': 'Leave Event',
    'details.leaving': 'Leaving...',
    'details.joinEvent': 'Join Event',
    'details.joining': 'Joining...',
    'details.eventEnded': 'This event has already ended',
    'details.editEvent': 'Edit Event',
    'details.deleteEvent': 'Delete Event',
    'details.deleting': 'Deleting...',

    'participants.back': 'Back',
    'participants.title': 'Participants',
    'participants.loading': 'Loading participants...',
    'participants.noParticipants': 'No participants yet',
    'participants.eventFallback': 'Event',
    'participants.participant': 'participant',
    'participants.participants': 'participants',
    'participants.you': 'You',
    'participants.creator': 'Creator',
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

    'create.title': 'Создать событие',
    'create.cancel': 'Отмена',
    'create.eventTitle': 'Название события',
    'create.eventTitlePlaceholder': 'Что ты планируешь?',
    'create.activityType': 'Тип активности',
    'create.description': 'Описание',
    'create.descriptionPlaceholder': 'Добавь детали о событии...',
    'create.date': 'Дата',
    'create.time': 'Время',
    'create.location': 'Локация',
    'create.locationPlaceholder': 'Где это произойдет?',
    'create.createButton': 'Создать событие',
    'create.creating': 'Создание...',

    'edit.title': 'Редактировать событие',
    'edit.cancel': 'Отмена',
    'edit.eventTitle': 'Название события',
    'edit.eventTitlePlaceholder': 'Что ты планируешь?',
    'edit.activityType': 'Тип активности',
    'edit.description': 'Описание',
    'edit.descriptionPlaceholder': 'Добавь детали о событии...',
    'edit.date': 'Дата',
    'edit.time': 'Время',
    'edit.location': 'Локация',
    'edit.locationPlaceholder': 'Где это произойдет?',
    'edit.saveButton': 'Сохранить изменения',
    'edit.saving': 'Сохранение...',

    'details.back': 'Назад',
    'details.pastEvent': 'Прошедшее событие',
    'details.noDescription': 'Описание отсутствует',
    'details.dateTime': 'Дата и время',
    'details.location': 'Локация',
    'details.locationNotSpecified': 'Локация не указана',
    'details.participants': 'Участники',
    'details.noParticipants': 'Пока нет участников',
    'details.you': 'Ты',
    'details.creator': 'Создатель',
    'details.leaveEvent': 'Покинуть событие',
    'details.leaving': 'Выход...',
    'details.joinEvent': 'Присоединиться',
    'details.joining': 'Подключение...',
    'details.eventEnded': 'Это событие уже завершилось',
    'details.editEvent': 'Редактировать событие',
    'details.deleteEvent': 'Удалить событие',
    'details.deleting': 'Удаление...',

    'participants.back': 'Назад',
    'participants.title': 'Участники',
    'participants.loading': 'Загрузка участников...',
    'participants.noParticipants': 'Пока нет участников',
    'participants.eventFallback': 'Событие',
    'participants.participant': 'участник',
    'participants.participants': 'участников',
    'participants.you': 'Ты',
    'participants.creator': 'Создатель',
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

    'create.title': 'Creează eveniment',
    'create.cancel': 'Anulează',
    'create.eventTitle': 'Titlul evenimentului',
    'create.eventTitlePlaceholder': 'Ce planifici?',
    'create.activityType': 'Tipul activității',
    'create.description': 'Descriere',
    'create.descriptionPlaceholder': 'Adaugă detalii despre eveniment...',
    'create.date': 'Data',
    'create.time': 'Ora',
    'create.location': 'Locație',
    'create.locationPlaceholder': 'Unde va avea loc?',
    'create.createButton': 'Creează eveniment',
    'create.creating': 'Se creează...',

    'edit.title': 'Editează evenimentul',
    'edit.cancel': 'Anulează',
    'edit.eventTitle': 'Titlul evenimentului',
    'edit.eventTitlePlaceholder': 'Ce planifici?',
    'edit.activityType': 'Tipul activității',
    'edit.description': 'Descriere',
    'edit.descriptionPlaceholder': 'Adaugă detalii despre eveniment...',
    'edit.date': 'Data',
    'edit.time': 'Ora',
    'edit.location': 'Locație',
    'edit.locationPlaceholder': 'Unde va avea loc?',
    'edit.saveButton': 'Salvează modificările',
    'edit.saving': 'Se salvează...',

    'details.back': 'Înapoi',
    'details.pastEvent': 'Eveniment trecut',
    'details.noDescription': 'Nu există descriere',
    'details.dateTime': 'Data și ora',
    'details.location': 'Locație',
    'details.locationNotSpecified': 'Locația nu este specificată',
    'details.participants': 'Participanți',
    'details.noParticipants': 'Încă nu sunt participanți',
    'details.you': 'Tu',
    'details.creator': 'Creator',
    'details.leaveEvent': 'Părăsește evenimentul',
    'details.leaving': 'Se iese...',
    'details.joinEvent': 'Participă',
    'details.joining': 'Se alătură...',
    'details.eventEnded': 'Acest eveniment s-a încheiat deja',
    'details.editEvent': 'Editează evenimentul',
    'details.deleteEvent': 'Șterge evenimentul',
    'details.deleting': 'Se șterge...',

    'participants.back': 'Înapoi',
    'participants.title': 'Participanți',
    'participants.loading': 'Se încarcă participanții...',
    'participants.noParticipants': 'Încă nu sunt participanți',
    'participants.eventFallback': 'Eveniment',
    'participants.participant': 'participant',
    'participants.participants': 'participanți',
    'participants.you': 'Tu',
    'participants.creator': 'Creator',
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

    'create.title': 'Створити подію',
    'create.cancel': 'Скасувати',
    'create.eventTitle': 'Назва події',
    'create.eventTitlePlaceholder': 'Що ти плануєш?',
    'create.activityType': 'Тип активності',
    'create.description': 'Опис',
    'create.descriptionPlaceholder': 'Додай деталі про подію...',
    'create.date': 'Дата',
    'create.time': 'Час',
    'create.location': 'Локація',
    'create.locationPlaceholder': 'Де це відбудеться?',
    'create.createButton': 'Створити подію',
    'create.creating': 'Створення...',

    'edit.title': 'Редагувати подію',
    'edit.cancel': 'Скасувати',
    'edit.eventTitle': 'Назва події',
    'edit.eventTitlePlaceholder': 'Що ти плануєш?',
    'edit.activityType': 'Тип активності',
    'edit.description': 'Опис',
    'edit.descriptionPlaceholder': 'Додай деталі про подію...',
    'edit.date': 'Дата',
    'edit.time': 'Час',
    'edit.location': 'Локація',
    'edit.locationPlaceholder': 'Де це відбудеться?',
    'edit.saveButton': 'Зберегти зміни',
    'edit.saving': 'Збереження...',

    'details.back': 'Назад',
    'details.pastEvent': 'Минула подія',
    'details.noDescription': 'Опис відсутній',
    'details.dateTime': 'Дата і час',
    'details.location': 'Локація',
    'details.locationNotSpecified': 'Локація не вказана',
    'details.participants': 'Учасники',
    'details.noParticipants': 'Поки немає учасників',
    'details.you': 'Ти',
    'details.creator': 'Створювач',
    'details.leaveEvent': 'Покинути подію',
    'details.leaving': 'Вихід...',
    'details.joinEvent': 'Приєднатися',
    'details.joining': 'Приєднання...',
    'details.eventEnded': 'Ця подія вже завершилася',
    'details.editEvent': 'Редагувати подію',
    'details.deleteEvent': 'Видалити подію',
    'details.deleting': 'Видалення...',

    'participants.back': 'Назад',
    'participants.title': 'Учасники',
    'participants.loading': 'Завантаження учасників...',
    'participants.noParticipants': 'Поки немає учасників',
    'participants.eventFallback': 'Подія',
    'participants.participant': 'учасник',
    'participants.participants': 'учасників',
    'participants.you': 'Ти',
    'participants.creator': 'Створювач',
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

    'create.title': 'Event erstellen',
    'create.cancel': 'Abbrechen',
    'create.eventTitle': 'Eventtitel',
    'create.eventTitlePlaceholder': 'Was planst du?',
    'create.activityType': 'Aktivitätstyp',
    'create.description': 'Beschreibung',
    'create.descriptionPlaceholder': 'Füge Details zu deinem Event hinzu...',
    'create.date': 'Datum',
    'create.time': 'Uhrzeit',
    'create.location': 'Ort',
    'create.locationPlaceholder': 'Wo findet es statt?',
    'create.createButton': 'Event erstellen',
    'create.creating': 'Wird erstellt...',

    'edit.title': 'Event bearbeiten',
    'edit.cancel': 'Abbrechen',
    'edit.eventTitle': 'Eventtitel',
    'edit.eventTitlePlaceholder': 'Was planst du?',
    'edit.activityType': 'Aktivitätstyp',
    'edit.description': 'Beschreibung',
    'edit.descriptionPlaceholder': 'Füge Details zu deinem Event hinzu...',
    'edit.date': 'Datum',
    'edit.time': 'Uhrzeit',
    'edit.location': 'Ort',
    'edit.locationPlaceholder': 'Wo findet es statt?',
    'edit.saveButton': 'Änderungen speichern',
    'edit.saving': 'Wird gespeichert...',

    'details.back': 'Zurück',
    'details.pastEvent': 'Vergangenes Event',
    'details.noDescription': 'Keine Beschreibung vorhanden',
    'details.dateTime': 'Datum & Uhrzeit',
    'details.location': 'Ort',
    'details.locationNotSpecified': 'Ort nicht angegeben',
    'details.participants': 'Teilnehmer',
    'details.noParticipants': 'Noch keine Teilnehmer',
    'details.you': 'Du',
    'details.creator': 'Ersteller',
    'details.leaveEvent': 'Event verlassen',
    'details.leaving': 'Wird verlassen...',
    'details.joinEvent': 'Event beitreten',
    'details.joining': 'Wird beigetreten...',
    'details.eventEnded': 'Dieses Event ist bereits beendet',
    'details.editEvent': 'Event bearbeiten',
    'details.deleteEvent': 'Event löschen',
    'details.deleting': 'Wird gelöscht...',

    'participants.back': 'Zurück',
    'participants.title': 'Teilnehmer',
    'participants.loading': 'Teilnehmer werden geladen...',
    'participants.noParticipants': 'Noch keine Teilnehmer',
    'participants.eventFallback': 'Event',
    'participants.participant': 'Teilnehmer',
    'participants.participants': 'Teilnehmer',
    'participants.you': 'Du',
    'participants.creator': 'Ersteller',
  },
};

export const t = (language: LanguageCode, key: TranslationKey) => {
  return translations[language][key] || translations.en[key] || key;
};