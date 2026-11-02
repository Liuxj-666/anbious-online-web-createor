/* Supabase backend adapter. Loaded after app-data.js and before app-views.js/app.js,
   so these global functions replace the optional Python server implementation. */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://qdphpjcxluayglvzvafp.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_VPLGorp1glXnuoHmlH4xCw_lVzMkOUe';
  const SUPABASE_BUCKET = 'images';
  const client = window.supabase && window.supabase.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;
  window.__anbiaoSupabase = client;

  function from(table) {
    if (!client) throw new Error('Supabase 尚未加载。');
    return client.from(table);
  }

  function withTimeout(promise, ms, fallback) {
    return Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
  }

  async function profileFor(user) {
    if (!user) return null;
    try {
      const result = await withTimeout(
        from('profiles').select('username,display_name').eq('id', user.id).maybeSingle(),
        2200,
        { data: null }
      );
      return result.data || null;
    } catch (error) {
      return null;
    }
  }

  async function hydrateUser(user) {
    const meta = user.user_metadata || {};
    authToken = '';
    authUser = {
      id: user.id,
      email: user.email || '',
      username: meta.username || String(user.email || '').split('@')[0],
      name: meta.display_name || meta.username || user.email || '访客'
    };
    const profile = await profileFor(user);
    if (profile) {
      authUser.username = profile.username || authUser.username;
      authUser.name = profile.display_name || authUser.name;
    }
    return authUser;
  }

  window.detectNetwork = async function detectNetworkSupabase() {
    networkOnline = Boolean(client);
    networkInfo = { server: Boolean(client), online: 0 };
    return networkOnline;
  };

  window.refreshNetworkSites = async function refreshNetworkSitesSupabase() {
    if (!client) return false;
    try {
      const { data, error } = await withTimeout(
        from('sites')
          .select('id,slug,title,snapshot,published_at,updated_at,last_seen,owner_id')
          .eq('published', true)
          .order('published_at', { ascending: false }),
        8000,
        { data: [], error: null }
      );
      if (error) throw error;
      const now = Date.now();
      networkSites = (data || []).map((row) => ({
        siteId: row.id,
        slug: row.slug,
        snapshot: { ...(row.snapshot || {}), siteId: row.id },
        publishedAt: row.published_at,
        online: row.last_seen ? now - new Date(row.last_seen).getTime() < 70000 : false,
        ownerId: row.owner_id
      }));
      networkInfo = {
        server: true,
        online: networkSites.filter((site) => site.online).length
      };
      return true;
    } catch (error) {
      console.warn('[岸标] Supabase 读取失败。', error);
      networkSites = [];
      networkInfo = { server: true, online: 0 };
      return false;
    }
  };

  window.restoreAuth = async function restoreAuthSupabase() {
    if (!client) {
      authUser = null;
      return null;
    }
    try {
      const { data } = await withTimeout(client.auth.getSession(), 2500, { data: { session: null } });
      const session = data && data.session;
      if (!session || !session.user) {
        authUser = null;
        return null;
      }
      return hydrateUser(session.user);
    } catch (error) {
      authUser = null;
      return null;
    }
  };

  window.authLogin = async function authLoginSupabase(email, password) {
    if (!client) throw new Error('Supabase 尚未加载。');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message || '登录失败。');
    return hydrateUser(data.user);
  };

  window.authRegister = async function authRegisterSupabase(email, password, username, name) {
    if (!client) throw new Error('Supabase 尚未加载。');
    const redirectTo = window.location.href.split('#')[0];
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { username, display_name: name || username }
      }
    });
    if (error) throw new Error(error.message || '注册失败。');
    if (!data.session) return { pending: true };
    return hydrateUser(data.user);
  };

  window.authLogout = async function authLogoutSupabase() {
    if (client) await client.auth.signOut();
    authUser = null;
    authToken = '';
  };

  async function uploadAsset(record, path) {
    if (!client || !record || !record.blob) return '';
    const { error } = await client.storage.from(SUPABASE_BUCKET).upload(path, record.blob, {
      upsert: true,
      contentType: record.type || 'application/octet-stream'
    });
    if (error) throw new Error(`媒体上传失败：${error.message}`);
    const { data } = client.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  function dataUrlToBlob(value) {
    const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(String(value || ''));
    if (!match) return null;
    const mime = match[1] || 'application/octet-stream';
    const binary = match[2] ? atob(match[3]) : decodeURIComponent(match[3]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  async function uploadInlineImage(value, userId, siteId, label) {
    if (!/^data:image\//i.test(String(value || ''))) return value;
    const blob = dataUrlToBlob(value);
    if (!blob) return value;
    const type = blob.type || 'image/jpeg';
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
    const path = `${userId}/${siteId}/images/${label}.${ext}`;
    const { error } = await client.storage.from(SUPABASE_BUCKET).upload(path, blob, { upsert: true, contentType: type });
    if (error) throw new Error(`图片上传失败：${error.message}`);
    const { data } = client.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function uploadHtmlImages(html, userId, siteId, label) {
    let source = String(html || '');
    if (!/data:image\//i.test(source)) return source;
    const matches = Array.from(source.matchAll(/src="(data:image\/[^"]+)"/gi));
    for (let index = 0; index < matches.length; index += 1) {
      const original = matches[index][1];
      const url = await uploadInlineImage(original, userId, siteId, `${label}-${index}`);
      source = source.split(original).join(url);
    }
    return source;
  }

  async function uploadSnapshotAssets(snapshot, userId, siteId) {
    const copy = JSON.parse(JSON.stringify(snapshot));
    const items = copy.items || [];
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const item = items[itemIndex];
      if (/^data:image\//i.test(String(item.src || ''))) {
        item.src = await uploadInlineImage(item.src, userId, siteId, `item-${itemIndex}-main`);
      }
      if (/^data:image\//i.test(String(item.cover || ''))) {
        item.cover = await uploadInlineImage(item.cover, userId, siteId, `item-${itemIndex}-cover`);
      }
      for (let imageIndex = 0; imageIndex < (item.images || []).length; imageIndex += 1) {
        const image = item.images[imageIndex];
        if (image && /^data:image\//i.test(String(image.src || ''))) {
          image.src = await uploadInlineImage(image.src, userId, siteId, `item-${itemIndex}-image-${imageIndex}`);
        }
      }
      if (item.bodyHtml) {
        item.bodyHtml = await uploadHtmlImages(item.bodyHtml, userId, siteId, `item-${itemIndex}-body`);
      }
      for (let chapterIndex = 0; chapterIndex < (item.chapters || []).length; chapterIndex += 1) {
        const chapter = item.chapters[chapterIndex];
        if (chapter && chapter.html) {
          chapter.html = await uploadHtmlImages(chapter.html, userId, siteId, `item-${itemIndex}-chapter-${chapterIndex}`);
        }
      }
      if (item.assetId) {
        const record = await getAssetRecord(item.assetId);
        if (record) {
          const url = await uploadAsset(record, `${userId}/${siteId}/${item.assetId}`);
          if (url) item.url = url;
        }
      }
      for (const key of ['episodes', 'files']) {
        for (const part of item[key] || []) {
          if (!part.assetId) continue;
          const record = await getAssetRecord(part.assetId);
          if (record) {
            const url = await uploadAsset(record, `${userId}/${siteId}/${part.assetId}`);
            if (url) part.url = url;
          }
        }
      }
    }
    for (let zoneIndex = 0; zoneIndex < (copy.zones || []).length; zoneIndex += 1) {
      const zone = copy.zones[zoneIndex];
      if (zone && /^data:image\//i.test(String(zone.cover || ''))) {
        zone.cover = await uploadInlineImage(zone.cover, userId, siteId, `zone-${zoneIndex}-cover`);
      }
    }
    if (/^data:image\//i.test(String(copy.cover || ''))) {
      copy.cover = await uploadInlineImage(copy.cover, userId, siteId, 'site-cover');
    }
    if (copy.appearance && /^data:image\//i.test(String(copy.appearance.image || ''))) {
      copy.appearance.image = await uploadInlineImage(copy.appearance.image, userId, siteId, 'site-background');
    }
    return copy;
  }

  function compactLocalImages(remoteSnapshot) {
    if (!remoteSnapshot || !Array.isArray(remoteSnapshot.items)) return;
    const byId = new Map(remoteSnapshot.items.map((item) => [item.id, item]));
    (state.site.items || []).forEach((item) => {
      const remote = byId.get(item.id);
      if (!remote) return;
      if (remote.src) item.src = remote.src;
      if (remote.cover) item.cover = remote.cover;
      if (Array.isArray(item.images) && Array.isArray(remote.images)) {
        item.images.forEach((image, index) => {
          if (image && remote.images[index] && remote.images[index].src) image.src = remote.images[index].src;
        });
      }
      if (remote.bodyHtml) item.bodyHtml = remote.bodyHtml;
      if (Array.isArray(item.chapters) && Array.isArray(remote.chapters)) {
        item.chapters.forEach((chapter, index) => {
          if (chapter && remote.chapters[index] && remote.chapters[index].html) chapter.html = remote.chapters[index].html;
        });
      }
    });
    (state.site.zones || []).forEach((zone, index) => {
      const remoteZone = (remoteSnapshot.zones || [])[index];
      if (zone && remoteZone && remoteZone.cover) zone.cover = remoteZone.cover;
    });
    if (remoteSnapshot.cover) state.site.cover = remoteSnapshot.cover;
    if (remoteSnapshot.appearance && state.site.appearance) state.site.appearance.image = remoteSnapshot.appearance.image || '';
  }

  async function uniqueSlug(base, siteId) {
    let candidate = base || 'my-shore';
    let index = 1;
    while (index < 25) {
      const { data } = await from('sites').select('id').eq('slug', candidate).maybeSingle();
      if (!data || data.id === siteId) return candidate;
      candidate = `${base}-${index}`;
      index += 1;
    }
    return `${base}-${authUser.username || 'site'}`;
  }

  async function saveSiteRow(row) {
    let candidate = row.slug;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const payload = { ...row, slug: candidate, snapshot: { ...row.snapshot, slug: candidate } };
      const { error } = await from('sites').upsert(payload, { onConflict: 'id' });
      if (!error) return candidate;
      if (error.code === '23505' || /duplicate key|unique/i.test(error.message || '')) {
        candidate = `${row.slug}-${attempt + 2}`;
        continue;
      }
      throw new Error(`公示失败：${error.message}`);
    }
    throw new Error('公示失败：站点路径冲突，请修改站点路径后重试。');
  }

  window.syncCloudSiteForAccount = async function syncCloudSiteForAccount() {
    if (!client || !authUser || stateLoadedForAccount) return false;
    try {
      const { data, error } = await withTimeout(
        from('sites')
          .select('id,slug,snapshot,published,consent_version,published_at,updated_at')
          .eq('owner_id', authUser.id)
          .order('updated_at', { ascending: false })
          .limit(5),
        3500,
        { data: [], error: null }
      );
      if (error || !Array.isArray(data) || !data.length) return false;
      const records = data.map((row) => {
        const payload = normalizePayload(row.snapshot);
        if (!payload) return null;
        const site = {
          id: payload.siteId || uid('site'),
          slug: row.slug || payload.slug,
          title: payload.title,
          owner: payload.owner,
          tags: payload.tags || [],
          tagline: payload.tagline,
          intro: payload.intro,
          cover: payload.cover,
          theme: payload.theme,
          appearance: payload.appearance,
          layout: payload.layout,
          zones: payload.zones,
          items: payload.items,
          createdAt: payload.createdAt || nowISO(),
          updatedAt: row.updated_at || nowISO()
        };
        return {
          site,
          publication: {
            ...createDefaultPublication(),
            active: Boolean(row.published),
            consentVersion: row.consent_version || CONSENT_VERSION,
            publishedAt: row.published_at,
            remoteSiteId: row.id,
            snapshot: payload,
            sourceHash: publicPayloadHash(payload)
          },
          comments: [],
          downloadRequests: []
        };
      }).filter(Boolean);
      if (!records.length) return false;
      state.sites = records;
      state.activeSiteId = records[0].site.id;
      state.site = records[0].site;
      state.publication = records[0].publication;
      state.comments = [];
      state.downloadRequests = [];
      stateLoadedFromStorage = true;
      stateLoadedForAccount = true;
      saveStateToStorage();
      await hydrateAssetUrls(state);
      return true;
    } catch (error) {
      console.warn('[岸标] 云端站点载入失败。', error);
      return false;
    }
  };

  window.publishToNetwork = async function publishToNetworkSupabase(snapshot) {
    if (!client) return { skipped: true };
    if (!authUser) throw new Error('请先登录后再公示；登录后网页会绑定到你的账号。');
    let siteId = state.publication.remoteSiteId;
    if (!siteId) {
      try {
        const { data } = await from('sites')
          .select('id')
          .eq('owner_id', authUser.id)
          .eq('slug', snapshot.slug)
          .maybeSingle();
        if (data && data.id) siteId = data.id;
      } catch (error) { /* fall through to a new id */ }
    }
    siteId = siteId || (crypto.randomUUID ? crypto.randomUUID() : uid('site'));
    state.publication.remoteSiteId = siteId;
    const availableSlug = await uniqueSlug(snapshot.slug, siteId);
    if (availableSlug !== snapshot.slug) {
      snapshot.slug = availableSlug;
      state.site.slug = availableSlug;
      if (state.publication.snapshot) state.publication.snapshot.slug = availableSlug;
    }
    const remoteSnapshot = await uploadSnapshotAssets(snapshot, authUser.id, siteId);
    remoteSnapshot.siteId = siteId;
    remoteSnapshot.publishedAt = snapshot.publishedAt || nowISO();
    const row = {
      id: siteId,
      owner_id: authUser.id,
      slug: snapshot.slug,
      title: snapshot.title,
      owner_name: snapshot.owner,
      snapshot: remoteSnapshot,
      published: true,
      consent_version: snapshot.consentVersion || CONSENT_VERSION,
      published_at: snapshot.publishedAt || nowISO(),
      updated_at: nowISO(),
      last_seen: nowISO()
    };
    const finalSlug = await saveSiteRow(row);
    if (finalSlug !== snapshot.slug) {
      snapshot.slug = finalSlug;
      state.site.slug = finalSlug;
      if (state.publication.snapshot) state.publication.snapshot.slug = finalSlug;
    }
    state.publication.networkSiteId = siteId;
    state.publication.networkSyncedAt = nowISO();
    compactLocalImages(remoteSnapshot);
    state.publication.sourceHash = publicPayloadHash(buildPublicPayload(state.site));
    saveStateToStorage();
    await refreshNetworkSites();
    return { skipped: false, siteId, snapshot: remoteSnapshot };
  };

  window.deleteRemoteSite = async function deleteRemoteSite(siteId) {
    if (!client || !authUser || !siteId) return;
    const { error } = await from('sites').delete().eq('id', siteId);
    if (error) throw new Error(`删除云端网页失败：${error.message}`);
    await refreshNetworkSites();
  };

  window.unpublishRemoteSite = async function unpublishRemoteSite(siteId) {
    if (!client || !authUser || !siteId) return;
    const { error } = await from('sites').update({ published: false, updated_at: nowISO() }).eq('id', siteId);
    if (error) throw new Error(`撤销云端公示失败：${error.message}`);
    await refreshNetworkSites();
  };

  window.revokeFromNetwork = async function revokeFromNetworkSupabase() {
    if (!client || !authUser) return;
    const siteId = state.publication.remoteSiteId;
    if (!siteId) return;
    try {
      await from('sites').update({ published: false, updated_at: nowISO() }).eq('id', siteId);
    } catch (error) {
      console.warn('[岸标] 撤回 Supabase 公示失败。', error);
    }
    networkSites = networkSites.filter((site) => site.siteId !== siteId);
  };

  window.heartbeatNetwork = async function heartbeatNetworkSupabase() {
    if (!client || !authUser || !state.publication.remoteSiteId || !state.publication.active) return;
    try {
      await from('sites').update({ last_seen: nowISO() }).eq('id', state.publication.remoteSiteId);
    } catch (error) { /* best effort */ }
  };

  window.fetchOwnerNetworkRequests = async function () { return []; };
  window.decideNetworkRequest = async function () { throw new Error('下载申请已由下载设置替代。'); };
  window.requestNetworkVideoDownload = async function () { throw new Error('下载申请已由下载设置替代。'); };
  window.refreshNetworkDownloadRecord = async function () { return null; };

  window.fetchNetworkVisits = async function fetchNetworkVisitsSupabase() {
    if (!client || !authUser) return [];
    const siteId = state.publication.remoteSiteId;
    if (!siteId) return [];
    const { data, error } = await from('visits')
      .select('id,user_id,user_name,visitor_id,path,user_agent,created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) {
      console.warn('[岸标] 访客记录读取失败。', error);
      return [];
    }
    networkVisits = (data || []).map((row) => ({
      ...row,
      userName: row.user_name || '',
      createdAt: row.created_at
    }));
    return networkVisits;
  };

  window.loadCommentsFor = async function loadCommentsForSupabase(siteId, itemId) {
    if (!client) return [];
    const { data, error } = await from('comments')
      .select('id,site_id,item_id,parent_id,user_id,author_name,body,created_at')
      .eq('site_id', siteId)
      .eq('item_id', itemId)
      .order('created_at', { ascending: true });
    if (error) return [];
    return data || [];
  };

  window.postComment = async function postCommentSupabase({ siteId, itemId, parentId, text }) {
    if (!client || !authUser) throw new Error('请先登录后再评论。');
    const { error } = await from('comments').insert({
      site_id: siteId,
      item_id: itemId,
      parent_id: parentId || null,
      user_id: authUser.id,
      author_name: authUser.name || authUser.username,
      body: text
    });
    if (error) throw new Error(`评论发送失败：${error.message}`);
  };

  window.recordVisit = async function recordVisitSupabase({ siteId, path }) {
    if (!client || !siteId) return;
    try {
      await from('visits').insert({
        site_id: siteId,
        user_id: authUser ? authUser.id : null,
        user_name: authUser ? (authUser.name || authUser.username) : '',
        visitor_id: visitorId(),
        path,
        user_agent: String(navigator.userAgent || '').slice(0, 240)
      });
    } catch (error) { /* best effort */ }
  };

  window.subscribeNetworkRealtime = function subscribeNetworkRealtime() {
    if (!client) return;
    try {
      client.channel('anbiao-public-sites')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => {
          refreshNetworkSites().then(() => {
            window.dispatchEvent(new CustomEvent('anbiao:sites-updated'));
          });
        })
        .subscribe();
    } catch (error) { /* realtime is optional */ }
  };

  if (client) {
    client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        authUser = null;
      }
    });
  }
})();
