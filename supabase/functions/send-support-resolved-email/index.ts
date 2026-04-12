import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'method_not_allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const supportFromEmail = Deno.env.get('SUPPORT_FROM_EMAIL');

  if (!supabaseUrl || !supabaseServiceRoleKey || !resendApiKey || !supportFromEmail) {
    return jsonResponse({ success: false, error: 'missing_configuration' }, 500);
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse({ success: false, error: 'missing_authorization' }, 401);
  }

  const accessToken = authorization.slice('Bearer '.length).trim();

  if (!accessToken) {
    return jsonResponse({ success: false, error: 'missing_access_token' }, 401);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user: callerUser },
    error: callerUserError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (callerUserError || !callerUser) {
    console.error('Failed to resolve caller user for support resolved email:', callerUserError);
    return jsonResponse({ success: false, error: 'unauthorized' }, 401);
  }

  const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
    .from('profiles')
    .select('role, is_banned')
    .eq('id', callerUser.id)
    .maybeSingle();

  if (callerProfileError) {
    console.error('Failed to load caller profile for support resolved email:', callerProfileError);
    return jsonResponse({ success: false, error: 'profile_lookup_failed' }, 500);
  }

  if (!callerProfile || callerProfile.role !== 'admin' || callerProfile.is_banned) {
    return jsonResponse({ success: false, error: 'forbidden' }, 403);
  }

  const body = await request.json().catch(() => null);
  const supportRequestId =
    typeof body?.support_request_id === 'string' && body.support_request_id.trim().length > 0
      ? body.support_request_id.trim()
      : null;

  if (!supportRequestId) {
    return jsonResponse({ success: false, error: 'invalid_support_request_id' }, 400);
  }

  const { data: supportRequest, error: supportRequestError } = await supabaseAdmin
    .from('support_requests')
    .select('id, user_id, subject, status')
    .eq('id', supportRequestId)
    .maybeSingle();

  if (supportRequestError) {
    console.error('Failed to load support request for resolved email:', supportRequestError);
    return jsonResponse({ success: false, error: 'support_request_lookup_failed' }, 500);
  }

  if (!supportRequest) {
    return jsonResponse({ success: false, error: 'support_request_not_found' }, 404);
  }

  if (supportRequest.status !== 'resolved') {
    return jsonResponse({ success: false, error: 'support_request_not_resolved' }, 409);
  }

  if (!supportRequest.user_id) {
    return jsonResponse({ success: false, error: 'support_request_has_no_author' }, 400);
  }

  const { data: targetUserData, error: targetUserError } =
    await supabaseAdmin.auth.admin.getUserById(supportRequest.user_id);

  if (targetUserError) {
    console.error('Failed to load support request author for resolved email:', targetUserError);
    return jsonResponse({ success: false, error: 'support_request_author_lookup_failed' }, 500);
  }

  const recipientEmail = targetUserData.user?.email?.trim();

  if (!recipientEmail) {
    return jsonResponse({ success: false, error: 'support_request_author_has_no_email' }, 400);
  }

  const safeTicketSubject = escapeHtml(supportRequest.subject?.trim() || 'Без темы');

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: supportFromEmail,
      to: [recipientEmail],
      subject: 'Ваш запрос в поддержку Gathr решен',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111111;">
          <p>Здравствуйте!</p>
          <p>Ваш запрос в поддержку Gathr был отмечен как решенный.</p>
          <p><strong>Тема тикета:</strong> ${safeTicketSubject}</p>
          <p>Если проблема осталась, пожалуйста, создайте новый запрос в поддержку в приложении.</p>
          <p>Спасибо,<br />Команда Gathr</p>
        </div>
      `,
    }),
  });

  const resendPayload = await resendResponse.json().catch(() => null);

  if (!resendResponse.ok) {
    console.error('Resend API failed for support resolved email:', resendPayload);
    return jsonResponse(
      {
        success: false,
        error: 'resend_failed',
      },
      502
    );
  }

  return jsonResponse({
    success: true,
    request_id: supportRequest.id,
    email: recipientEmail,
    resend_id: resendPayload?.id ?? null,
  });
});
