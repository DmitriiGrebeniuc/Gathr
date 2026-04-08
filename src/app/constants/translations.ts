import type { LanguageCode } from './languages';

type TranslationKey =
    | 'common.user'
    | 'common.unknown'
    | 'common.guestUser'
    | 'common.event'
    | 'common.dateNotSpecified'
    | 'common.invalidDate'
    | 'common.timeNotSpecified'
    | 'common.invalidTime'
    | 'common.justNow'
    | 'common.back'
    | 'common.loading'
    | 'common.loadingSettings'
    | 'common.loadingNotifications'
    | 'common.save'
    | 'common.saving'
    | 'common.cancel'
    | 'common.name'
    | 'common.email'
    | 'common.password'
    | 'bottomNav.home'
    | 'bottomNav.notifications'
    | 'bottomNav.profile'
    | 'activity.sports'
    | 'activity.networking'
    | 'activity.study'
    | 'activity.entertainment'
    | 'activity.foodDrinks'
    | 'activity.outdoors'
    | 'activity.tech'
    | 'activity.other'
    | 'welcome.tagline'
    | 'welcome.login'
    | 'welcome.signup'
    | 'login.back'
    | 'login.title'
    | 'login.email'
    | 'login.emailPlaceholder'
    | 'login.password'
    | 'login.passwordPlaceholder'
    | 'login.submit'
    | 'login.submitting'
    | 'login.noAccount'
    | 'login.signupLink'
    | 'login.enterEmail'
    | 'login.enterPassword'
    | 'login.failed'
    | 'login.unexpectedError'
    | 'signup.back'
    | 'signup.title'
    | 'signup.name'
    | 'signup.namePlaceholder'
    | 'signup.email'
    | 'signup.emailPlaceholder'
    | 'signup.password'
    | 'signup.passwordPlaceholder'
    | 'signup.submit'
    | 'signup.submitting'
    | 'signup.haveAccount'
    | 'signup.loginLink'
    | 'signup.enterName'
    | 'signup.enterEmail'
    | 'signup.enterPassword'
    | 'signup.failed'
    | 'signup.userIdMissing'
    | 'signup.profileNotSaved'
    | 'signup.success'
    | 'signup.unexpectedError'
    | 'editProfile.title'
    | 'editProfile.name'
    | 'editProfile.email'
    | 'editProfile.saveButton'
    | 'editProfile.loading'
    | 'editProfile.saving'
    | 'editProfile.userNotFound'
    | 'editProfile.enterName'
    | 'editProfile.saveFailed'
    | 'editProfile.unexpectedError'
    | 'notificationSettings.title'
    | 'notificationSettings.sectionTitle'
    | 'notificationSettings.upcomingEvents'
    | 'notificationSettings.upcomingEventsDescription'
    | 'notificationSettings.newParticipants'
    | 'notificationSettings.newParticipantsDescription'
    | 'security.title'
    | 'security.cardTitle'
    | 'security.cardDescription'
    | 'support.title'
    | 'support.cardTitle'
    | 'support.cardDescription'
    | 'notifications.title'
    | 'notifications.emptyTitle'
    | 'notifications.emptyDescription'
    | 'notifications.upcomingIconLabel'
    | 'notifications.joinIconLabel'
    | 'notifications.startedAlready'
    | 'notifications.inMinutes'
    | 'notifications.inHours'
    | 'notifications.upcomingDefault'
    | 'notifications.startsInMinutes'
    | 'notifications.startsInHours'
    | 'notifications.justNow'
    | 'notifications.minutesAgo'
    | 'notifications.hoursAgo'
    | 'notifications.daysAgo'
    | 'notifications.someone'
    | 'notifications.joinedYourEvent'
    | 'notifications.and'
    | 'notifications.others'
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
    | 'participants.creator'
    | 'create.enterTitle'
    | 'create.selectDate'
    | 'create.selectTime'
    | 'create.userNotAuthenticated'
    | 'create.invalidDateTime'
    | 'create.failed'
    | 'create.creatorParticipantFailed'
    | 'create.unexpectedError';

const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
    en: {
        'common.user': 'User',
        'common.unknown': 'Unknown',
        'common.guestUser': 'Guest User',
        'common.event': 'Event',
        'common.dateNotSpecified': 'Date not specified',
        'common.invalidDate': 'Invalid date',
        'common.timeNotSpecified': 'Time not specified',
        'common.invalidTime': 'Invalid time',
        'common.justNow': 'Just now',
        'common.back': 'Back',
        'common.loading': 'Loading...',
        'common.loadingSettings': 'Loading settings...',
        'common.loadingNotifications': 'Loading notifications...',
        'common.save': 'Save',
        'common.saving': 'Saving...',
        'common.cancel': 'Cancel',
        'common.name': 'Name',
        'common.email': 'Email',
        'common.password': 'Password',

        'bottomNav.home': 'Home',
        'bottomNav.notifications': 'Notifications',
        'bottomNav.profile': 'Profile',

        'activity.sports': 'Sports',
        'activity.networking': 'Networking',
        'activity.study': 'Study',
        'activity.entertainment': 'Entertainment',
        'activity.foodDrinks': 'Food & Drinks',
        'activity.outdoors': 'Outdoors',
        'activity.tech': 'Tech',
        'activity.other': 'Other',

        'welcome.tagline': 'Fast. Simple. Together.',
        'welcome.login': 'Log In',
        'welcome.signup': 'Sign Up',

        'login.back': 'Back',
        'login.title': 'Welcome back',
        'login.email': 'Email',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Password',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Log In',
        'login.submitting': 'Logging in...',
        'login.noAccount': "Don't have an account?",
        'login.signupLink': 'Sign up',
        'login.enterEmail': 'Enter email',
        'login.enterPassword': 'Enter password',
        'login.failed': 'Failed to log in',
        'login.unexpectedError': 'An error occurred while logging in',

        'signup.back': 'Back',
        'signup.title': 'Create account',
        'signup.name': 'Name',
        'signup.namePlaceholder': 'Your name',
        'signup.email': 'Email',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Password',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Sign Up',
        'signup.submitting': 'Signing up...',
        'signup.haveAccount': 'Already have an account?',
        'signup.loginLink': 'Log in',
        'signup.enterName': 'Enter name',
        'signup.enterEmail': 'Enter email',
        'signup.enterPassword': 'Enter password',
        'signup.failed': 'Failed to sign up',
        'signup.userIdMissing': 'User was created, but the user ID could not be obtained',
        'signup.profileNotSaved': 'Account was created, but the profile was not saved',
        'signup.success': 'Registration successful',
        'signup.unexpectedError': 'An error occurred during registration',

        'editProfile.title': 'Edit Profile',
        'editProfile.name': 'Name',
        'editProfile.email': 'Email',
        'editProfile.saveButton': 'Save Changes',
        'editProfile.loading': 'Loading...',
        'editProfile.saving': 'Saving...',
        'editProfile.userNotFound': 'User not found',
        'editProfile.enterName': 'Enter name',
        'editProfile.saveFailed': 'Failed to save profile',
        'editProfile.unexpectedError': 'An error occurred while saving the profile',

        'notificationSettings.title': 'Notification Settings',
        'notificationSettings.sectionTitle': 'NOTIFICATIONS',
        'notificationSettings.upcomingEvents': 'Upcoming Events',
        'notificationSettings.upcomingEventsDescription': 'Get notified before events start',
        'notificationSettings.newParticipants': 'New Participants',
        'notificationSettings.newParticipantsDescription': 'When someone joins your event',

        'security.title': 'Privacy & Security',
        'security.cardTitle': 'Security settings',
        'security.cardDescription': 'Advanced security features will be available soon.',

        'support.title': 'Help & Support',
        'support.cardTitle': 'Support center',
        'support.cardDescription': 'Help articles and support options will be available soon.',

        'notifications.title': 'Notifications',
        'notifications.emptyTitle': 'No notifications yet',
        'notifications.emptyDescription': 'Upcoming events and participant updates will appear here.',
        'notifications.upcomingIconLabel': 'Upcoming event',
        'notifications.joinIconLabel': 'New participant',
        'notifications.startedAlready': 'Started already',
        'notifications.inMinutes': 'In {count} min',
        'notifications.inHours': 'In {count} hour|In {count} hours',
        'notifications.upcomingDefault': '{title} is coming up',
        'notifications.startsInMinutes': '{title} starts in {count} min',
        'notifications.startsInHours': '{title} starts in {count} hour|{title} starts in {count} hours',
        'notifications.justNow': 'Just now',
        'notifications.minutesAgo': '{count} min ago',
        'notifications.hoursAgo': '{count} hour ago|{count} hours ago',
        'notifications.daysAgo': '{count} day ago|{count} days ago',
        'notifications.someone': 'Someone',
        'notifications.joinedYourEvent': '{names} joined your event {title}',
        'notifications.and': 'and',
        'notifications.others': 'others',

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
        'create.enterTitle': 'Enter an event title',
        'create.selectDate': 'Select a date',
        'create.selectTime': 'Select a time',
        'create.userNotAuthenticated': 'User is not authenticated',
        'create.invalidDateTime': 'Invalid date or time',
        'create.failed': 'Failed to create event',
        'create.creatorParticipantFailed': 'Event was created, but the creator was not added as a participant',
        'create.unexpectedError': 'An error occurred while creating the event',
    },

    ru: {
        'common.user': 'Пользователь',
        'common.unknown': 'Неизвестно',
        'common.guestUser': 'Гость',
        'common.event': 'Событие',
        'common.dateNotSpecified': 'Дата не указана',
        'common.invalidDate': 'Некорректная дата',
        'common.timeNotSpecified': 'Время не указано',
        'common.invalidTime': 'Некорректное время',
        'common.justNow': 'Только что',
        'common.back': 'Назад',
        'common.loading': 'Загрузка...',
        'common.loadingSettings': 'Загрузка настроек...',
        'common.loadingNotifications': 'Загрузка уведомлений...',
        'common.save': 'Сохранить',
        'common.saving': 'Сохранение...',
        'common.cancel': 'Отмена',
        'common.name': 'Имя',
        'common.email': 'Email',
        'common.password': 'Пароль',

        'bottomNav.home': 'Главная',
        'bottomNav.notifications': 'Уведомления',
        'bottomNav.profile': 'Профиль',

        'activity.sports': 'Спорт',
        'activity.networking': 'Нетворкинг',
        'activity.study': 'Учёба',
        'activity.entertainment': 'Развлечения',
        'activity.foodDrinks': 'Еда и напитки',
        'activity.outdoors': 'На улице',
        'activity.tech': 'Технологии',
        'activity.other': 'Другое',

        'welcome.tagline': 'Быстро. Просто. Вместе.',
        'welcome.login': 'Войти',
        'welcome.signup': 'Регистрация',

        'login.back': 'Назад',
        'login.title': 'С возвращением',
        'login.email': 'Email',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Пароль',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Войти',
        'login.submitting': 'Вход...',
        'login.noAccount': 'Нет аккаунта?',
        'login.signupLink': 'Зарегистрироваться',
        'login.enterEmail': 'Введите email',
        'login.enterPassword': 'Введите пароль',
        'login.failed': 'Не удалось войти',
        'login.unexpectedError': 'Произошла ошибка при входе',

        'signup.back': 'Назад',
        'signup.title': 'Создать аккаунт',
        'signup.name': 'Имя',
        'signup.namePlaceholder': 'Ваше имя',
        'signup.email': 'Email',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Пароль',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Зарегистрироваться',
        'signup.submitting': 'Регистрация...',
        'signup.haveAccount': 'Уже есть аккаунт?',
        'signup.loginLink': 'Войти',
        'signup.enterName': 'Введите имя',
        'signup.enterEmail': 'Введите email',
        'signup.enterPassword': 'Введите пароль',
        'signup.failed': 'Не удалось зарегистрироваться',
        'signup.userIdMissing': 'Пользователь создан, но не удалось получить его ID',
        'signup.profileNotSaved': 'Аккаунт создан, но профиль не сохранился',
        'signup.success': 'Регистрация успешна',
        'signup.unexpectedError': 'Произошла ошибка при регистрации',

        'editProfile.title': 'Редактировать профиль',
        'editProfile.name': 'Имя',
        'editProfile.email': 'Email',
        'editProfile.saveButton': 'Сохранить изменения',
        'editProfile.loading': 'Загрузка...',
        'editProfile.saving': 'Сохранение...',
        'editProfile.userNotFound': 'Пользователь не найден',
        'editProfile.enterName': 'Введите имя',
        'editProfile.saveFailed': 'Не удалось сохранить профиль',
        'editProfile.unexpectedError': 'Произошла ошибка при сохранении профиля',

        'notificationSettings.title': 'Настройки уведомлений',
        'notificationSettings.sectionTitle': 'УВЕДОМЛЕНИЯ',
        'notificationSettings.upcomingEvents': 'Предстоящие события',
        'notificationSettings.upcomingEventsDescription': 'Получать уведомления перед началом событий',
        'notificationSettings.newParticipants': 'Новые участники',
        'notificationSettings.newParticipantsDescription': 'Когда кто-то присоединяется к вашему событию',

        'security.title': 'Конфиденциальность и безопасность',
        'security.cardTitle': 'Настройки безопасности',
        'security.cardDescription': 'Расширенные функции безопасности скоро будут доступны.',

        'support.title': 'Помощь и поддержка',
        'support.cardTitle': 'Центр поддержки',
        'support.cardDescription': 'Статьи помощи и варианты поддержки скоро будут доступны.',

        'notifications.title': 'Уведомления',
        'notifications.emptyTitle': 'Пока нет уведомлений',
        'notifications.emptyDescription': 'Здесь появятся предстоящие события и обновления участников.',
        'notifications.upcomingIconLabel': 'Предстоящее событие',
        'notifications.joinIconLabel': 'Новый участник',
        'notifications.startedAlready': 'Уже началось',
        'notifications.inMinutes': 'Через {count} мин',
        'notifications.inHours': 'Через {count} час|Через {count} часов',
        'notifications.upcomingDefault': '{title} скоро начнётся',
        'notifications.startsInMinutes': '{title} начнётся через {count} мин',
        'notifications.startsInHours': '{title} начнётся через {count} час|{title} начнётся через {count} часов',
        'notifications.justNow': 'Только что',
        'notifications.minutesAgo': '{count} мин назад',
        'notifications.hoursAgo': '{count} час назад|{count} часов назад',
        'notifications.daysAgo': '{count} день назад|{count} дней назад',
        'notifications.someone': 'Кто-то',
        'notifications.joinedYourEvent': '{names} присоединился к вашему событию {title}|{names} присоединились к вашему событию {title}',
        'notifications.and': 'и',
        'notifications.others': 'других',

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
        'create.enterTitle': 'Введите название события',
        'create.selectDate': 'Выберите дату',
        'create.selectTime': 'Выберите время',
        'create.userNotAuthenticated': 'Пользователь не авторизован',
        'create.invalidDateTime': 'Некорректные дата или время',
        'create.failed': 'Не удалось создать событие',
        'create.creatorParticipantFailed': 'Событие создано, но автор не был добавлен в участники',
        'create.unexpectedError': 'Произошла ошибка при создании события',
    },

    ro: {
        'common.user': 'Utilizator',
        'common.unknown': 'Necunoscut',
        'common.guestUser': 'Vizitator',
        'common.event': 'Eveniment',
        'common.dateNotSpecified': 'Data nu este specificată',
        'common.invalidDate': 'Dată invalidă',
        'common.timeNotSpecified': 'Ora nu este specificată',
        'common.invalidTime': 'Oră invalidă',
        'common.justNow': 'Chiar acum',
        'common.back': 'Înapoi',
        'common.loading': 'Se încarcă...',
        'common.loadingSettings': 'Se încarcă setările...',
        'common.loadingNotifications': 'Se încarcă notificările...',
        'common.save': 'Salvează',
        'common.saving': 'Se salvează...',
        'common.cancel': 'Anulează',
        'common.name': 'Nume',
        'common.email': 'Email',
        'common.password': 'Parolă',

        'bottomNav.home': 'Acasă',
        'bottomNav.notifications': 'Notificări',
        'bottomNav.profile': 'Profil',

        'activity.sports': 'Sport',
        'activity.networking': 'Networking',
        'activity.study': 'Studiu',
        'activity.entertainment': 'Distracție',
        'activity.foodDrinks': 'Mâncare și băuturi',
        'activity.outdoors': 'În aer liber',
        'activity.tech': 'Tehnologie',
        'activity.other': 'Altele',

        'welcome.tagline': 'Rapid. Simplu. Împreună.',
        'welcome.login': 'Autentificare',
        'welcome.signup': 'Înregistrare',

        'login.back': 'Înapoi',
        'login.title': 'Bine ai revenit',
        'login.email': 'Email',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Parolă',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Autentificare',
        'login.submitting': 'Se autentifică...',
        'login.noAccount': 'Nu ai cont?',
        'login.signupLink': 'Înregistrează-te',
        'login.enterEmail': 'Introdu emailul',
        'login.enterPassword': 'Introdu parola',
        'login.failed': 'Autentificarea a eșuat',
        'login.unexpectedError': 'A apărut o eroare la autentificare',

        'signup.back': 'Înapoi',
        'signup.title': 'Creează cont',
        'signup.name': 'Nume',
        'signup.namePlaceholder': 'Numele tău',
        'signup.email': 'Email',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Parolă',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Înregistrare',
        'signup.submitting': 'Se înregistrează...',
        'signup.haveAccount': 'Ai deja cont?',
        'signup.loginLink': 'Autentifică-te',
        'signup.enterName': 'Introdu numele',
        'signup.enterEmail': 'Introdu emailul',
        'signup.enterPassword': 'Introdu parola',
        'signup.failed': 'Înregistrarea a eșuat',
        'signup.userIdMissing': 'Utilizatorul a fost creat, dar ID-ul nu a putut fi obținut',
        'signup.profileNotSaved': 'Contul a fost creat, dar profilul nu a fost salvat',
        'signup.success': 'Înregistrare reușită',
        'signup.unexpectedError': 'A apărut o eroare la înregistrare',

        'editProfile.title': 'Editează profilul',
        'editProfile.name': 'Nume',
        'editProfile.email': 'Email',
        'editProfile.saveButton': 'Salvează modificările',
        'editProfile.loading': 'Se încarcă...',
        'editProfile.saving': 'Se salvează...',
        'editProfile.userNotFound': 'Utilizatorul nu a fost găsit',
        'editProfile.enterName': 'Introdu numele',
        'editProfile.saveFailed': 'Profilul nu a putut fi salvat',
        'editProfile.unexpectedError': 'A apărut o eroare la salvarea profilului',

        'notificationSettings.title': 'Setări notificări',
        'notificationSettings.sectionTitle': 'NOTIFICĂRI',
        'notificationSettings.upcomingEvents': 'Evenimente viitoare',
        'notificationSettings.upcomingEventsDescription': 'Primește notificări înainte de începerea evenimentelor',
        'notificationSettings.newParticipants': 'Participanți noi',
        'notificationSettings.newParticipantsDescription': 'Când cineva se alătură evenimentului tău',

        'security.title': 'Confidențialitate și securitate',
        'security.cardTitle': 'Setări de securitate',
        'security.cardDescription': 'Funcțiile avansate de securitate vor fi disponibile în curând.',

        'support.title': 'Ajutor și suport',
        'support.cardTitle': 'Centrul de suport',
        'support.cardDescription': 'Articolele de ajutor și opțiunile de suport vor fi disponibile în curând.',

        'notifications.title': 'Notificări',
        'notifications.emptyTitle': 'Încă nu există notificări',
        'notifications.emptyDescription': 'Evenimentele viitoare și actualizările participanților vor apărea aici.',
        'notifications.upcomingIconLabel': 'Eveniment viitor',
        'notifications.joinIconLabel': 'Participant nou',
        'notifications.startedAlready': 'A început deja',
        'notifications.inMinutes': 'În {count} min',
        'notifications.inHours': 'În {count} oră|În {count} ore',
        'notifications.upcomingDefault': '{title} urmează în curând',
        'notifications.startsInMinutes': '{title} începe în {count} min',
        'notifications.startsInHours': '{title} începe în {count} oră|{title} începe în {count} ore',
        'notifications.justNow': 'Chiar acum',
        'notifications.minutesAgo': 'Acum {count} min',
        'notifications.hoursAgo': 'Acum {count} oră|Acum {count} ore',
        'notifications.daysAgo': 'Acum {count} zi|Acum {count} zile',
        'notifications.someone': 'Cineva',
        'notifications.joinedYourEvent': '{names} s-a alăturat evenimentului tău {title}|{names} s-au alăturat evenimentului tău {title}',
        'notifications.and': 'și',
        'notifications.others': 'alții',

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
        'create.enterTitle': 'Introdu titlul evenimentului',
        'create.selectDate': 'Selectează data',
        'create.selectTime': 'Selectează ora',
        'create.userNotAuthenticated': 'Utilizatorul nu este autentificat',
        'create.invalidDateTime': 'Data sau ora este invalidă',
        'create.failed': 'Evenimentul nu a putut fi creat',
        'create.creatorParticipantFailed': 'Evenimentul a fost creat, dar autorul nu a fost adăugat ca participant',
        'create.unexpectedError': 'A apărut o eroare la crearea evenimentului',
    },

    uk: {
        'common.user': 'Користувач',
        'common.unknown': 'Невідомо',
        'common.guestUser': 'Гість',
        'common.event': 'Подія',
        'common.dateNotSpecified': 'Дату не вказано',
        'common.invalidDate': 'Некоректна дата',
        'common.timeNotSpecified': 'Час не вказано',
        'common.invalidTime': 'Некоректний час',
        'common.justNow': 'Щойно',
        'common.back': 'Назад',
        'common.loading': 'Завантаження...',
        'common.loadingSettings': 'Завантаження налаштувань...',
        'common.loadingNotifications': 'Завантаження сповіщень...',
        'common.save': 'Зберегти',
        'common.saving': 'Збереження...',
        'common.cancel': 'Скасувати',
        'common.name': "Ім'я",
        'common.email': 'Email',
        'common.password': 'Пароль',

        'bottomNav.home': 'Головна',
        'bottomNav.notifications': 'Сповіщення',
        'bottomNav.profile': 'Профіль',

        'activity.sports': 'Спорт',
        'activity.networking': 'Нетворкінг',
        'activity.study': 'Навчання',
        'activity.entertainment': 'Розваги',
        'activity.foodDrinks': 'Їжа та напої',
        'activity.outdoors': 'Надворі',
        'activity.tech': 'Технології',
        'activity.other': 'Інше',

        'welcome.tagline': 'Швидко. Просто. Разом.',
        'welcome.login': 'Увійти',
        'welcome.signup': 'Реєстрація',

        'login.back': 'Назад',
        'login.title': 'З поверненням',
        'login.email': 'Email',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Пароль',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Увійти',
        'login.submitting': 'Вхід...',
        'login.noAccount': 'Немає акаунта?',
        'login.signupLink': 'Зареєструватися',
        'login.enterEmail': 'Введіть email',
        'login.enterPassword': 'Введіть пароль',
        'login.failed': 'Не вдалося увійти',
        'login.unexpectedError': 'Сталася помилка під час входу',

        'signup.back': 'Назад',
        'signup.title': 'Створити акаунт',
        'signup.name': "Ім'я",
        'signup.namePlaceholder': "Ваше ім'я",
        'signup.email': 'Email',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Пароль',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Зареєструватися',
        'signup.submitting': 'Реєстрація...',
        'signup.haveAccount': 'Вже маєте акаунт?',
        'signup.loginLink': 'Увійти',
        'signup.enterName': "Введіть ім'я",
        'signup.enterEmail': 'Введіть email',
        'signup.enterPassword': 'Введіть пароль',
        'signup.failed': 'Не вдалося зареєструватися',
        'signup.userIdMissing': 'Користувача створено, але не вдалося отримати його ID',
        'signup.profileNotSaved': 'Акаунт створено, але профіль не збережено',
        'signup.success': 'Реєстрація успішна',
        'signup.unexpectedError': 'Сталася помилка під час реєстрації',

        'editProfile.title': 'Редагувати профіль',
        'editProfile.name': "Ім'я",
        'editProfile.email': 'Email',
        'editProfile.saveButton': 'Зберегти зміни',
        'editProfile.loading': 'Завантаження...',
        'editProfile.saving': 'Збереження...',
        'editProfile.userNotFound': 'Користувача не знайдено',
        'editProfile.enterName': "Введіть ім'я",
        'editProfile.saveFailed': 'Не вдалося зберегти профіль',
        'editProfile.unexpectedError': 'Сталася помилка під час збереження профілю',

        'notificationSettings.title': 'Налаштування сповіщень',
        'notificationSettings.sectionTitle': 'СПОВІЩЕННЯ',
        'notificationSettings.upcomingEvents': 'Майбутні події',
        'notificationSettings.upcomingEventsDescription': 'Отримуйте сповіщення перед початком подій',
        'notificationSettings.newParticipants': 'Нові учасники',
        'notificationSettings.newParticipantsDescription': 'Коли хтось приєднується до вашої події',

        'security.title': 'Конфіденційність і безпека',
        'security.cardTitle': 'Налаштування безпеки',
        'security.cardDescription': 'Розширені функції безпеки скоро будуть доступні.',

        'support.title': 'Допомога та підтримка',
        'support.cardTitle': 'Центр підтримки',
        'support.cardDescription': 'Довідкові статті та варіанти підтримки скоро будуть доступні.',

        'notifications.title': 'Сповіщення',
        'notifications.emptyTitle': 'Сповіщень поки немає',
        'notifications.emptyDescription': 'Тут з’являться майбутні події та оновлення учасників.',
        'notifications.upcomingIconLabel': 'Майбутня подія',
        'notifications.joinIconLabel': 'Новий учасник',
        'notifications.startedAlready': 'Уже почалося',
        'notifications.inMinutes': 'Через {count} хв',
        'notifications.inHours': 'Через {count} годину|Через {count} годин',
        'notifications.upcomingDefault': '{title} незабаром почнеться',
        'notifications.startsInMinutes': '{title} почнеться через {count} хв',
        'notifications.startsInHours': '{title} почнеться через {count} годину|{title} почнеться через {count} годин',
        'notifications.justNow': 'Щойно',
        'notifications.minutesAgo': '{count} хв тому',
        'notifications.hoursAgo': '{count} год тому|{count} год тому',
        'notifications.daysAgo': '{count} дн тому|{count} дн тому',
        'notifications.someone': 'Хтось',
        'notifications.joinedYourEvent': '{names} приєднався до вашої події {title}|{names} приєдналися до вашої події {title}',
        'notifications.and': 'і',
        'notifications.others': 'інші',

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
        'create.enterTitle': 'Введіть назву події',
        'create.selectDate': 'Оберіть дату',
        'create.selectTime': 'Оберіть час',
        'create.userNotAuthenticated': 'Користувач не авторизований',
        'create.invalidDateTime': 'Некоректні дата або час',
        'create.failed': 'Не вдалося створити подію',
        'create.creatorParticipantFailed': 'Подію створено, але автора не було додано до учасників',
        'create.unexpectedError': 'Сталася помилка під час створення події',
    },

    de: {
        'common.user': 'Benutzer',
        'common.unknown': 'Unbekannt',
        'common.guestUser': 'Gast',
        'common.event': 'Event',
        'common.dateNotSpecified': 'Datum nicht angegeben',
        'common.invalidDate': 'Ungültiges Datum',
        'common.timeNotSpecified': 'Uhrzeit nicht angegeben',
        'common.invalidTime': 'Ungültige Uhrzeit',
        'common.justNow': 'Gerade eben',
        'common.back': 'Zurück',
        'common.loading': 'Wird geladen...',
        'common.loadingSettings': 'Einstellungen werden geladen...',
        'common.loadingNotifications': 'Benachrichtigungen werden geladen...',
        'common.save': 'Speichern',
        'common.saving': 'Wird gespeichert...',
        'common.cancel': 'Abbrechen',
        'common.name': 'Name',
        'common.email': 'E-Mail',
        'common.password': 'Passwort',

        'bottomNav.home': 'Start',
        'bottomNav.notifications': 'Benachrichtigungen',
        'bottomNav.profile': 'Profil',

        'activity.sports': 'Sport',
        'activity.networking': 'Networking',
        'activity.study': 'Lernen',
        'activity.entertainment': 'Unterhaltung',
        'activity.foodDrinks': 'Essen & Trinken',
        'activity.outdoors': 'Draußen',
        'activity.tech': 'Technik',
        'activity.other': 'Andere',

        'welcome.tagline': 'Schnell. Einfach. Gemeinsam.',
        'welcome.login': 'Anmelden',
        'welcome.signup': 'Registrieren',

        'login.back': 'Zurück',
        'login.title': 'Willkommen zurück',
        'login.email': 'E-Mail',
        'login.emailPlaceholder': 'your@email.com',
        'login.password': 'Passwort',
        'login.passwordPlaceholder': '••••••••',
        'login.submit': 'Anmelden',
        'login.submitting': 'Anmeldung...',
        'login.noAccount': 'Noch kein Konto?',
        'login.signupLink': 'Registrieren',
        'login.enterEmail': 'E-Mail eingeben',
        'login.enterPassword': 'Passwort eingeben',
        'login.failed': 'Anmeldung fehlgeschlagen',
        'login.unexpectedError': 'Beim Anmelden ist ein Fehler aufgetreten',

        'signup.back': 'Zurück',
        'signup.title': 'Konto erstellen',
        'signup.name': 'Name',
        'signup.namePlaceholder': 'Dein Name',
        'signup.email': 'E-Mail',
        'signup.emailPlaceholder': 'your@email.com',
        'signup.password': 'Passwort',
        'signup.passwordPlaceholder': '••••••••',
        'signup.submit': 'Registrieren',
        'signup.submitting': 'Registrierung...',
        'signup.haveAccount': 'Hast du bereits ein Konto?',
        'signup.loginLink': 'Anmelden',
        'signup.enterName': 'Name eingeben',
        'signup.enterEmail': 'E-Mail eingeben',
        'signup.enterPassword': 'Passwort eingeben',
        'signup.failed': 'Registrierung fehlgeschlagen',
        'signup.userIdMissing': 'Benutzer wurde erstellt, aber die Benutzer-ID konnte nicht abgerufen werden',
        'signup.profileNotSaved': 'Konto wurde erstellt, aber das Profil wurde nicht gespeichert',
        'signup.success': 'Registrierung erfolgreich',
        'signup.unexpectedError': 'Bei der Registrierung ist ein Fehler aufgetreten',

        'editProfile.title': 'Profil bearbeiten',
        'editProfile.name': 'Name',
        'editProfile.email': 'E-Mail',
        'editProfile.saveButton': 'Änderungen speichern',
        'editProfile.loading': 'Wird geladen...',
        'editProfile.saving': 'Wird gespeichert...',
        'editProfile.userNotFound': 'Benutzer nicht gefunden',
        'editProfile.enterName': 'Name eingeben',
        'editProfile.saveFailed': 'Profil konnte nicht gespeichert werden',
        'editProfile.unexpectedError': 'Beim Speichern des Profils ist ein Fehler aufgetreten',

        'notificationSettings.title': 'Benachrichtigungseinstellungen',
        'notificationSettings.sectionTitle': 'BENACHRICHTIGUNGEN',
        'notificationSettings.upcomingEvents': 'Bevorstehende Events',
        'notificationSettings.upcomingEventsDescription': 'Erhalte Benachrichtigungen vor dem Start von Events',
        'notificationSettings.newParticipants': 'Neue Teilnehmer',
        'notificationSettings.newParticipantsDescription': 'Wenn jemand deinem Event beitritt',

        'security.title': 'Datenschutz und Sicherheit',
        'security.cardTitle': 'Sicherheitseinstellungen',
        'security.cardDescription': 'Erweiterte Sicherheitsfunktionen werden bald verfügbar sein.',

        'support.title': 'Hilfe und Support',
        'support.cardTitle': 'Support-Center',
        'support.cardDescription': 'Hilfsartikel und Supportoptionen werden bald verfügbar sein.',

        'notifications.title': 'Benachrichtigungen',
        'notifications.emptyTitle': 'Noch keine Benachrichtigungen',
        'notifications.emptyDescription': 'Bevorstehende Events und Teilnehmer-Updates werden hier angezeigt.',
        'notifications.upcomingIconLabel': 'Bevorstehendes Event',
        'notifications.joinIconLabel': 'Neuer Teilnehmer',
        'notifications.startedAlready': 'Bereits gestartet',
        'notifications.inMinutes': 'In {count} Min',
        'notifications.inHours': 'In {count} Stunde|In {count} Stunden',
        'notifications.upcomingDefault': '{title} steht bevor',
        'notifications.startsInMinutes': '{title} startet in {count} Min',
        'notifications.startsInHours': '{title} startet in {count} Stunde|{title} startet in {count} Stunden',
        'notifications.justNow': 'Gerade eben',
        'notifications.minutesAgo': 'Vor {count} Min',
        'notifications.hoursAgo': 'Vor {count} Stunde|Vor {count} Stunden',
        'notifications.daysAgo': 'Vor {count} Tag|Vor {count} Tagen',
        'notifications.someone': 'Jemand',
        'notifications.joinedYourEvent': '{names} ist deinem Event {title} beigetreten|{names} sind deinem Event {title} beigetreten',
        'notifications.and': 'und',
        'notifications.others': 'andere',

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
        'create.enterTitle': 'Gib einen Eventtitel ein',
        'create.selectDate': 'Wähle ein Datum',
        'create.selectTime': 'Wähle eine Uhrzeit',
        'create.userNotAuthenticated': 'Benutzer ist nicht angemeldet',
        'create.invalidDateTime': 'Ungültiges Datum oder ungültige Uhrzeit',
        'create.failed': 'Event konnte nicht erstellt werden',
        'create.creatorParticipantFailed': 'Das Event wurde erstellt, aber der Ersteller wurde nicht als Teilnehmer hinzugefügt',
        'create.unexpectedError': 'Beim Erstellen des Events ist ein Fehler aufgetreten',
    },
        import type { LanguageCode } from './languages';
import { t } from './translations';

export const ACTIVITY_TYPES = [
    { value: 'sports', translationKey: 'activity.sports', emoji: '⚽' },
    { value: 'networking', translationKey: 'activity.networking', emoji: '🤝' },
    { value: 'study', translationKey: 'activity.study', emoji: '📚' },
    { value: 'entertainment', translationKey: 'activity.entertainment', emoji: '🎮' },
    { value: 'food_drinks', translationKey: 'activity.foodDrinks', emoji: '☕' },
    { value: 'outdoors', translationKey: 'activity.outdoors', emoji: '🌿' },
    { value: 'tech', translationKey: 'activity.tech', emoji: '💻' },
    { value: 'other', translationKey: 'activity.other', emoji: '✨' },
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number]['value'];

export const getActivityTypeMeta = (
    value?: string | null,
    language: LanguageCode = 'en'
) => {
    const type =
        ACTIVITY_TYPES.find((item) => item.value === value) ||
        ACTIVITY_TYPES.find((item) => item.value === 'other')!;

    return {
        ...type,
        label: t(language, type.translationKey),
    };
};