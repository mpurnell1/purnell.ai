export default {
  async fetch(request, env, ctx) {
    const cf = request.cf || {};
    const referer = request.headers.get('referer') || '';
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('cf-connecting-ip') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const url = new URL(request.url);
    const ref = url.searchParams.get('ref') || '';

    // Click tracker
    ctx.waitUntil(
      fetch('https://purnell-resume.goatcounter.com/api/v0/count', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GOATCOUNTER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          no_sessions: true,
          hits: [{
            path: '/resume.pdf',
            ref: ref || referer,
            user_agent: userAgent,
            ip: ip,
          }],
        }),
      })
    );

    // Discord alert
    const location = [cf.city, cf.region, cf.country].filter(Boolean).join(', ');
    const coords = (cf.latitude && cf.longitude) ? `${cf.latitude}, ${cf.longitude}` : null;
    const mapsLink = coords ? `[map](https://maps.google.com/?q=${cf.latitude},${cf.longitude})` : '';

    const fields = [
      { name: '🏢 Organization', value: cf.asOrganization || 'unknown', inline: true },
      { name: '🌐 ASN', value: cf.asn ? `AS${cf.asn}` : 'unknown', inline: true },
      { name: '📍 Location', value: location ? `${location} ${mapsLink}` : 'unknown', inline: false },
    ];

    if (cf.postalCode) fields.push({ name: '📮 Postal', value: cf.postalCode, inline: true });
    if (cf.timezone) fields.push({ name: '🕐 Timezone', value: cf.timezone, inline: true });
    if (cf.colo) fields.push({ name: '🏭 CF Colo', value: cf.colo, inline: true });

    if (ref) fields.push({ name: '🏷️ Source', value: ref, inline: true });
    if (referer) fields.push({ name: '↩️ Referrer', value: referer.slice(0, 1000), inline: false });
    if (url.search) fields.push({ name: '🔗 Query', value: url.search.slice(0, 500), inline: false });

    if (acceptLanguage) fields.push({ name: '🗣️ Languages', value: acceptLanguage.slice(0, 200), inline: false });
    fields.push({ name: '🖥️ User Agent', value: userAgent.slice(0, 1000) || 'none', inline: false });

    const techBits = [cf.httpProtocol, cf.tlsVersion].filter(Boolean).join(' · ');
    if (techBits) fields.push({ name: '⚙️ Connection', value: techBits, inline: false });

    if (cf.botManagement?.score !== undefined) {
      fields.push({ name: '🤖 Bot score', value: `${cf.botManagement.score}/99`, inline: true });
    }
    if (cf.verifiedBotCategory) {
      fields.push({ name: '✅ Verified bot', value: cf.verifiedBotCategory, inline: true });
    }

    ctx.waitUntil(
      fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '📄 Resume viewed',
            color: 0x5865F2,
            fields: fields,
            footer: { text: `IP: ${ip}` },
            timestamp: new Date().toISOString(),
          }],
        }),
      })
    );

    // Redirect to resume
    return Response.redirect('https://purnell.ai/resume.pdf', 302);
  }
}