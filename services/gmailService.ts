import { getAccessToken, signInWithGoogle } from './firebase';

export async function sendEmail(subject: string, body: string, toAddress?: string): Promise<void> {
  let token = await getAccessToken();
  if (!token) {
    await signInWithGoogle();
    token = await getAccessToken();
  }
  if (!token) throw new Error('Authentication required for Gmail.');

  // If no "to" address is provided, try to fetch the current user's profile to get their own email
  let to = toAddress;
  if (!to) {
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
          const profile = await profileRes.json();
          to = profile.emailAddress;
      } else {
           throw new Error('Please specify a recipient email address.');
      }
  }

  // Construct RFC 2822 message
  const emailLines = [
    `To: ${to}`,
    'Subject: =?utf-8?B?' + btoa(unescape(encodeURIComponent(subject))) + '?=',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ];

  const emailRaw = emailLines.join('\n');
  const encodedEmail = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedEmail }),
  });

  if (!res.ok) {
     const error = await res.json();
     console.error("Gmail Error:", error);
     throw new Error(error.error?.message || 'Failed to send email via Gmail');
  }
}
