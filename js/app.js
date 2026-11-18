/* Tinteiro — início */
(async function(T){
  T.Atmo.start();
  try {
    await T.Store.init();
    await T.Store.loadProjects();
  } catch (e) { console.error(e); }
  // versão independente: funciona sem internet e pode ser instalada como app
  if (T.STANDALONE && 'serviceWorker' in navigator && /^https?:/.test(location.protocol)) { try { navigator.serviceWorker.register('sw.js'); } catch (e) {} }
  T.Shell.applyTheme();
  T.Sound.volume(T.Store.prefs().volume ?? .6);
  const last = T.Store.prefs().lastProject;
  const p = last && T.Store.get(last);
  if (p && !p.meta?.archived && (T.Store.mode === 'cloud' || T.STANDALONE)) T.Shell.openProject(last);
  else T.Shell.home();
  // lembra o último livro aberto
  const open = T.Shell.openProject;
  T.Shell.openProject = function(pid, layout){ T.Store.setPrefs({ lastProject: pid }); return open.call(T.Shell, pid, layout); };
  const home = T.Shell.home;
  T.Shell.home = function(){ if (T.Shell.pid) T.Store.setPrefs({ lastProject: null }); return home.call(T.Shell); };
})(window.T);
