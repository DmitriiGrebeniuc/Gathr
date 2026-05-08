import { CalendarDays, MapPin } from 'lucide-react';
import { EventContactMethodsDisplay } from '../EventContactMethodsSection';
import { EventLocationMap } from '../EventLocationMap';
import { LoadingCard, LoadingLine } from '../LoadingState';
import type { EventContactMethods } from '../../lib/publicData';
import { hasAnyEventContactMethods } from '../../lib/eventContacts';

type EventDetailsOverviewProps = {
  eventData: any;
  joinMode: 'open' | 'request';
  isPastEvent: boolean;
  isClosedAccessResolving: boolean;
  hasVisiblePrivatePreview: boolean;
  shouldShowClosedRestrictedState: boolean;
  shouldShowPrivateFieldsLoading: boolean;
  displayedDateTime: string | null | undefined;
  displayedLocation: string | null | undefined;
  displayedLocationLat: number | null;
  displayedLocationLng: number | null;
  googleMapsUrl: string | null;
  isNativeApp: boolean;
  canViewClosedDetails: boolean;
  hasLocationCoordinates: boolean;
  eventStateResolved: boolean;
  canViewEventContacts: boolean;
  contactMethods: EventContactMethods | null;
  translate: (key: any) => string;
  formatDate: (dateTime?: string | null) => string;
};

export function EventDetailsOverview({
  eventData,
  joinMode,
  isPastEvent,
  isClosedAccessResolving,
  hasVisiblePrivatePreview,
  shouldShowClosedRestrictedState,
  shouldShowPrivateFieldsLoading,
  displayedDateTime,
  displayedLocation,
  displayedLocationLat,
  displayedLocationLng,
  googleMapsUrl,
  isNativeApp,
  canViewClosedDetails,
  hasLocationCoordinates,
  eventStateResolved,
  canViewEventContacts,
  contactMethods,
  translate,
  formatDate,
}: EventDetailsOverviewProps) {
  return (
    <>
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1>{eventData.title}</h1>
            {joinMode === 'request' && (
              <span
                className="mt-2 inline-flex text-[10px] px-2 py-1 rounded-full border"
                style={{
                  borderColor: 'var(--accent-border-strong)',
                  color: 'var(--accent)',
                  backgroundColor: 'var(--accent-soft-muted)',
                }}
              >
                {translate('details.closedBadge')}
              </span>
            )}
          </div>

          {isPastEvent && (
            <span
              className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
              style={{
                borderColor: 'var(--accent-border-muted)',
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-soft-muted)',
              }}
            >
              {translate('details.pastEvent')}
            </span>
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {eventData.description || translate('details.noDescription')}
        </p>
      </div>

      {isClosedAccessResolving && !hasVisiblePrivatePreview && (
        <LoadingCard lines={['42%', '88%', '72%']} />
      )}

      {shouldShowClosedRestrictedState && (
        <div
          className="rounded-2xl border px-4 py-4"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--accent-border-muted)',
          }}
        >
          <p style={{ color: 'var(--accent)' }}>{translate('details.closedTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {translate('details.closedDescription')}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <CalendarDays size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{translate('details.dateTime')}</p>
            <p>
              {shouldShowPrivateFieldsLoading
                ? ''
                : shouldShowClosedRestrictedState
                  ? translate('details.closedDateHidden')
                  : formatDate(displayedDateTime)}
            </p>
            {shouldShowPrivateFieldsLoading && (
              <div className="mt-2 space-y-2">
                <LoadingLine width="7rem" />
                <LoadingLine width="5rem" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <MapPin size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{translate('details.location')}</p>
              <p>
                {shouldShowPrivateFieldsLoading
                  ? ''
                  : shouldShowClosedRestrictedState
                    ? translate('details.closedLocationHidden')
                    : displayedLocation || translate('details.locationNotSpecified')}
              </p>
              {shouldShowPrivateFieldsLoading && (
                <div className="mt-2 space-y-2">
                  <LoadingLine width="9rem" />
                  <LoadingLine width="12rem" />
                </div>
              )}

              {googleMapsUrl && isNativeApp && canViewClosedDetails && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-sm"
                  style={{ color: 'var(--accent)' }}
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>

          {shouldShowPrivateFieldsLoading ? (
            <LoadingCard className="min-h-[10rem]" lines={['100%', '100%', '90%']} />
          ) : shouldShowClosedRestrictedState ? (
            <div
              className="rounded-2xl border px-4 py-4 text-sm text-muted-foreground"
              style={{ backgroundColor: 'var(--card)' }}
            >
              {translate('details.closedMapHidden')}
            </div>
          ) : hasLocationCoordinates ? (
            <div className="mt-3 -mx-6 sm:mx-0">
              <EventLocationMap
                lat={displayedLocationLat}
                lng={displayedLocationLng}
                height={256}
              />
            </div>
          ) : null}
        </div>
      </div>

      {eventStateResolved &&
        canViewEventContacts &&
        hasAnyEventContactMethods(contactMethods) && (
          <EventContactMethodsDisplay contacts={contactMethods} />
        )}
    </>
  );
}
