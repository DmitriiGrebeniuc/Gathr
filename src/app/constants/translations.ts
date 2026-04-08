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
    | 'edit.saving';

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
    },
};

export const t = (language: LanguageCode, key: TranslationKey) => {
    return translations[language][key] || translations.en[key] || key;
};