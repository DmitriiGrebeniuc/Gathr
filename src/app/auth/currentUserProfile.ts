import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { getUsableContactEmail } from '../../lib/authContactEmail';
import { CURRENT_LEGAL_VERSION } from '../constants/legalDocuments';

export type CurrentProfileAccess = {
  id: string;
  name: string | null;
  role?: string | null;
  plan?: string | null;
  has_unlimited_access?: boolean | null;
  is_banned?: boolean | null;
};

export type CurrentLegalConsent = {
  accepted_terms_at?: string | null;
  accepted_privacy_at?: string | null;
  accepted_legal_version?: string | null;
};

function getPreferredProfileName(user: User, fallbackName: string) {
  const metadata = user.user_metadata ?? {};
  const profileNameCandidates = [
    metadata.name,
    metadata.full_name,
    metadata.user_name,
    metadata.preferred_username,
    metadata.given_name,
    metadata.nickname,
  ];

  const metadataName = profileNameCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );

  if (metadataName) {
    return metadataName.trim();
  }

  const emailName = getUsableContactEmail(user.email ?? null)?.split('@')[0]?.trim();

  if (emailName) {
    return emailName;
  }

  return fallbackName;
}

export async function syncProfileFromAuthUser(user: User, fallbackName: string) {
  const preferredName = getPreferredProfileName(user, fallbackName);
  const acceptedTermsAt =
    typeof user.user_metadata?.accepted_terms_at === 'string'
      ? user.user_metadata.accepted_terms_at
      : null;
  const acceptedPrivacyAt =
    typeof user.user_metadata?.accepted_privacy_at === 'string'
      ? user.user_metadata.accepted_privacy_at
      : null;
  const acceptedLegalVersion =
    typeof user.user_metadata?.accepted_legal_version === 'string'
      ? user.user_metadata.accepted_legal_version
      : null;

  try {
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, accepted_terms_at, accepted_privacy_at, accepted_legal_version')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Failed to load profile after auth:', profileError);
      return;
    }

    if (!existingProfile) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        name: preferredName,
        accepted_terms_at: acceptedTermsAt,
        accepted_privacy_at: acceptedPrivacyAt,
        accepted_legal_version: acceptedLegalVersion,
      });

      if (
        insertError &&
        insertError.code !== '23505' &&
        !insertError.message.toLowerCase().includes('duplicate key')
      ) {
        console.error('Failed to create missing profile after auth:', insertError);
      }

      return;
    }

    if (!existingProfile.name?.trim() && preferredName) {
      const updatePayload: Record<string, string | null> = {
        name: preferredName,
      };

      if (!existingProfile.accepted_terms_at && acceptedTermsAt) {
        updatePayload.accepted_terms_at = acceptedTermsAt;
      }

      if (!existingProfile.accepted_privacy_at && acceptedPrivacyAt) {
        updatePayload.accepted_privacy_at = acceptedPrivacyAt;
      }

      if (!existingProfile.accepted_legal_version && acceptedLegalVersion) {
        updatePayload.accepted_legal_version = acceptedLegalVersion;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to enrich profile name after auth:', updateError);
      }
      return;
    }

    if (
      (!existingProfile.accepted_terms_at && acceptedTermsAt) ||
      (!existingProfile.accepted_privacy_at && acceptedPrivacyAt) ||
      (!existingProfile.accepted_legal_version && acceptedLegalVersion)
    ) {
      const updatePayload: Record<string, string | null> = {};

      if (!existingProfile.accepted_terms_at && acceptedTermsAt) {
        updatePayload.accepted_terms_at = acceptedTermsAt;
      }

      if (!existingProfile.accepted_privacy_at && acceptedPrivacyAt) {
        updatePayload.accepted_privacy_at = acceptedPrivacyAt;
      }

      if (!existingProfile.accepted_legal_version && acceptedLegalVersion) {
        updatePayload.accepted_legal_version = acceptedLegalVersion;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to enrich legal consent after auth:', updateError);
      }
    }
  } catch (error) {
    console.error('Unexpected profile sync error:', error);
  }
}

export async function getCurrentProfileAccess() {
  try {
    const { data, error } = await supabase.rpc('get_my_profile_access').maybeSingle();

    if (error) {
      console.error('Failed to load current profile access:', error);
      return null;
    }

    return (data as CurrentProfileAccess | null) ?? null;
  } catch (error) {
    console.error('Unexpected current profile access error:', error);
    return null;
  }
}

export async function getCurrentLegalConsent(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('accepted_terms_at, accepted_privacy_at, accepted_legal_version')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load current legal consent:', error);
      return null;
    }

    return (data as CurrentLegalConsent | null) ?? null;
  } catch (error) {
    console.error('Unexpected current legal consent error:', error);
    return null;
  }
}

export function hasAcceptedCurrentLegal(consent: CurrentLegalConsent | null) {
  if (!consent) {
    return false;
  }

  return Boolean(
    consent.accepted_terms_at &&
      consent.accepted_privacy_at &&
      consent.accepted_legal_version === CURRENT_LEGAL_VERSION
  );
}
