export type LegalDocumentSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  lastUpdated: string;
  intro: string[];
  sections: LegalDocumentSection[];
};

export const TERMS_OF_SERVICE: LegalDocument = {
  lastUpdated: '14.04.2026',
  intro: [
    'Welcome to Gathr. These Terms of Service govern your access to and use of the Gathr website, app, and related services.',
    'By accessing or using Gathr, you agree to these Terms. If you do not agree, do not use the service.',
  ],
  sections: [
    {
      heading: 'About Gathr',
      paragraphs: [
        'Gathr is a platform that helps users discover, create, join, share, and manage local events and micro-meetups.',
        'Gathr is currently operated by Dmitrii Grebeniuc, based in the Republic of Moldova.',
        'Contact: support@gathr-app.site',
      ],
    },
    {
      heading: 'Eligibility',
      paragraphs: [
        'You may use Gathr only if you are legally able to enter into a binding agreement under applicable law.',
        'Gathr is not intended for children under the age of 13. By using the service, you represent that you meet the minimum age requirement applicable in your jurisdiction.',
      ],
    },
    {
      heading: 'User Accounts',
      paragraphs: [
        'To access certain features, you may need to create an account.',
        'You are responsible for providing accurate information, keeping your login credentials secure, and all activity that occurs under your account.',
        'You must not impersonate another person or create an account using false or misleading information.',
      ],
    },
    {
      heading: 'User Content and Events',
      paragraphs: [
        'Users may create profiles, events, descriptions, invitations, and other content through the service.',
        'You retain ownership of the content you create, but by submitting content to Gathr, you grant Gathr a non-exclusive, worldwide, royalty-free license to host, display, process, reproduce, and distribute such content as necessary to operate, improve, and provide the service.',
        'You are solely responsible for the content you post and for your interactions with other users.',
      ],
    },
    {
      heading: 'Acceptable Use',
      paragraphs: [
        'You agree not to use Gathr for unlawful purposes, post false, deceptive, abusive, threatening, hateful, or harmful content, harass, spam, or manipulate other users, infringe intellectual property, privacy, or other legal rights, attempt to disrupt, damage, reverse engineer, or gain unauthorized access to the service, or misuse invitations, events, notifications, moderation tools, or platform functionality.',
      ],
    },
    {
      heading: 'Moderation and Enforcement',
      paragraphs: [
        'Gathr reserves the right to monitor, moderate, remove content, limit features, suspend accounts, or ban users where necessary to protect the platform, its users, or legal compliance.',
        'This includes the right to remove events, restrict participation, deny access, or terminate accounts for violations of these Terms, harmful behavior, abuse, fraud, or safety concerns.',
      ],
    },
    {
      heading: 'Events and Offline Interactions',
      paragraphs: [
        'Gathr only provides a platform for users to create, discover, and join events.',
        'Gathr does not verify the identity, intentions, conduct, or reliability of users, and does not organize, supervise, or control offline meetings or interactions.',
        'Participation in any event, meeting, or contact with other users is entirely at your own risk. You are solely responsible for your safety, decisions, conduct, and interactions before, during, and after any event.',
        'To the maximum extent permitted by law, Gathr is not responsible for the behavior of users, for the legality or safety of events, or for any loss, harm, injury, damage, dispute, or incident arising out of offline interactions or attendance at events.',
      ],
    },
    {
      heading: 'Availability of Service',
      paragraphs: [
        'Gathr may change, suspend, or discontinue any part of the service at any time, with or without notice.',
        'We do not guarantee uninterrupted availability, error-free operation, or compatibility with all devices, browsers, or networks.',
      ],
    },
    {
      heading: 'Future Paid Features',
      paragraphs: [
        'Gathr may introduce paid plans, subscriptions, premium features, or other monetized functionality in the future, including a Pro plan.',
        'At this time, no payment processing or monetary transactions are provided through the service unless explicitly stated otherwise.',
        'If paid features are introduced later, additional terms may apply.',
      ],
    },
    {
      heading: 'Intellectual Property',
      paragraphs: [
        'The Gathr name, branding, interface, and service-related materials, excluding user content, are owned by or licensed to Gathr and are protected by applicable intellectual property laws.',
        'You may not copy, distribute, modify, or exploit the service or its branding except as permitted by law or by written permission.',
      ],
    },
    {
      heading: 'Privacy',
      paragraphs: ['Your use of Gathr is also governed by the Privacy Policy.'],
    },
    {
      heading: 'Termination',
      paragraphs: [
        'You may stop using Gathr at any time.',
        'Gathr may suspend, restrict, or terminate your access at any time if you violate these Terms, create risk for the platform or other users, or where moderation or legal enforcement requires it.',
      ],
    },
    {
      heading: 'Disclaimer',
      paragraphs: [
        'Gathr is provided on an "as is" and "as available" basis.',
        'To the maximum extent permitted by law, Gathr disclaims warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.',
      ],
    },
    {
      heading: 'Limitation of Liability',
      paragraphs: [
        'To the maximum extent permitted by law, Gathr shall not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of data, profits, goodwill, or business opportunities arising from your use of or inability to use the service.',
      ],
    },
    {
      heading: 'Changes to These Terms',
      paragraphs: [
        'We may update these Terms from time to time. The updated version will be posted with a new "Last updated" date. Continued use of the service after changes become effective means you accept the updated Terms.',
      ],
    },
    {
      heading: 'Governing Law',
      paragraphs: [
        'These Terms shall be governed by the laws of the Republic of Moldova, unless otherwise required by applicable mandatory consumer protection law.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        'If you have questions about these Terms, contact:',
        'support@gathr-app.site',
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  lastUpdated: '14.04.2026',
  intro: [
    'This Privacy Policy explains how Gathr collects, uses, stores, transfers, and protects personal data when you use the Gathr website, app, and related services.',
    'If you use Gathr, you agree to the practices described in this Privacy Policy.',
  ],
  sections: [
    {
      heading: 'Who operates Gathr',
      paragraphs: [
        'Gathr is currently operated by Dmitrii Grebeniuc, based in the Republic of Moldova.',
        'Contact: support@gathr-app.site',
      ],
    },
    {
      heading: 'Data We Collect',
      paragraphs: [
        'Depending on how you use Gathr, we may collect account and profile data such as your name or display name, email address, authentication-related account identifiers, language preferences, and profile settings.',
        'We may also collect event-related data such as events you create, event descriptions, date, time, location, city, participation records, invitations, and invitation responses.',
        'Usage and technical data may include device or browser information, logs, session and authentication events, and app interaction data necessary to operate, secure, and improve the service.',
        'Support and moderation data may include support requests, messages sent through support forms, account role, access entitlements, and moderation status such as bans or restrictions where applicable.',
      ],
    },
    {
      heading: 'How We Use Data',
      paragraphs: [
        'We use personal data to provide and operate Gathr, authenticate users and manage accounts, enable event creation, participation, sharing, invitations, and notifications, personalize language and app settings, maintain safety, moderation, and abuse prevention, provide support, improve product functionality, and comply with legal obligations and enforce our Terms.',
      ],
    },
    {
      heading: 'Legal Basis',
      paragraphs: [
        'Where applicable, we process data based on your consent, performance of a service you request, legitimate interests in operating, securing, moderating, and improving Gathr, and compliance with legal obligations.',
      ],
    },
    {
      heading: 'Sharing of Data',
      paragraphs: [
        'We do not sell personal data.',
        'We may share data with service providers and infrastructure tools used to operate Gathr, including hosting, authentication, database, email, support, and related technical providers, only to the extent reasonably necessary to run the service.',
        'We may also disclose information when required by law, to protect rights, safety, and security, in connection with moderation, fraud prevention, or abuse investigations, or in connection with a future transfer, restructuring, or sale of the service.',
      ],
    },
    {
      heading: 'International and Cross-Border Data Transfers',
      paragraphs: [
        'Gathr may use third-party providers and infrastructure located outside the Republic of Moldova. As a result, personal data may be processed or stored in other jurisdictions, including jurisdictions in the European Union and the United States.',
        'By using Gathr, you understand that your data may be transferred to and processed in countries outside Moldova, subject to reasonable safeguards and operational necessity.',
      ],
    },
    {
      heading: 'User Content Visibility',
      paragraphs: [
        'Certain content you create in Gathr may be visible to other users depending on the feature, including your display name, event content, participation in events, and invitations or related event interactions where relevant.',
        'Please avoid posting sensitive personal data in public or user-visible areas.',
      ],
    },
    {
      heading: 'Data Retention',
      paragraphs: [
        'We retain personal data only as long as reasonably necessary for providing the service, support and moderation, security and abuse prevention, legal compliance, and legitimate operational needs.',
        'Retention periods may vary depending on the type of data and applicable legal requirements.',
      ],
    },
    {
      heading: 'Your Rights',
      paragraphs: [
        'Subject to applicable law, including the legislation of the Republic of Moldova on personal data protection, you may have the right to request access to your personal data, request correction or updating of inaccurate data, request deletion of data where appropriate, object to certain processing, request restriction of processing in certain cases, and seek legal protection of your rights.',
        'To make a request, contact support@gathr-app.site.',
      ],
    },
    {
      heading: 'Account Deletion and Access Requests',
      paragraphs: [
        'You may request account-related or privacy-related support by contacting support@gathr-app.site.',
        'At this stage, some account and profile management operations may be handled manually or through available in-app functionality.',
        'We may retain certain records where necessary for legal, security, moderation, abuse-prevention, or operational reasons.',
      ],
    },
    {
      heading: 'Security',
      paragraphs: [
        'We use reasonable technical and organizational measures to protect personal data. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      heading: "Children's Privacy",
      paragraphs: [
        'Gathr is not intended for children under 13, and we do not knowingly collect personal data from children under 13.',
        'If you believe a child has provided personal data in violation of this policy, contact support@gathr-app.site.',
      ],
    },
    {
      heading: 'Future Paid Features',
      paragraphs: [
        'Gathr may introduce paid features, subscriptions, premium access, or Pro plans in the future.',
        'If payment processing is added later, this Privacy Policy may be updated to reflect the handling of billing and transaction-related data.',
        'At this time, no payment processing is provided through the service unless explicitly stated otherwise.',
      ],
    },
    {
      heading: 'Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. The updated version will be posted with a new "Last updated" date. Continued use of Gathr after changes become effective means you accept the updated policy.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        'If you have questions about this Privacy Policy or about your personal data, contact:',
        'support@gathr-app.site',
      ],
    },
  ],
};
