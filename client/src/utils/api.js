/**
 * API Routing Utility
 * Handles difference between Development (Proxy) and Production (Relative Paths)
 */
export const resolveEndpoint = (endpoint) => {
  if (endpoint.includes('/')) return endpoint;
  
  const mapping = {
    'fleet': ['vehiculos.php', 'choferes.php', 'mantenimiento.php', 'rutas.php'],
    'finance': ['recaudacion.php', 'gastos.php', 'reportes_financieros.php', 'reportes_exportacion.php'],
    'auth': ['login.php', 'registrar.php', 'session.php', 'invitaciones.php', 'usuarios.php'],
    'system': ['audit_system.php', 'dashboard.php', 'notificaciones.php', 'swagger.json']
  };

  for (const [dir, files] of Object.entries(mapping)) {
    if (files.some(f => endpoint.startsWith(f))) return `${dir}/${endpoint}`;
  }
  return endpoint;
};

export const getApiUrl = (endpoint) => {
  const resolved = resolveEndpoint(endpoint);
  if (import.meta.env.DEV) {
    return `/api/${resolved}`;
  }
  return `../../api/${resolved}`;
};
