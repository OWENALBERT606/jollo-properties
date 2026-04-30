// permissions.ts

export type Permission = {
  create: string;
  read: string;
  update: string;
  delete: string;
};

export type ModulePermissions = {
  display: string;
  name: string;
  permissions: Permission;
};

export const permissions: ModulePermissions[] = [
  {
    display: "Dashboard",
    name: "dashboard",
    permissions: {
      create: "dashboard.create",
      read: "dashboard.read",
      update: "dashboard.update",
      delete: "dashboard.delete",
    },
  },
  {
    display: "Users",
    name: "users",
    permissions: {
      create: "users.create",
      read: "users.read",
      update: "users.update",
      delete: "users.delete",
    },
  },
  {
    display: "Roles",
    name: "roles",
    permissions: {
      create: "roles.create",
      read: "roles.read",
      update: "roles.update",
      delete: "roles.delete",
    },
  },
  {
    display: "Parishes",
    name: "parishes",
    permissions: {
      create: "parishes.create",
      read: "parishes.read",
      update: "parishes.update",
      delete: "parishes.delete",
    },
  },
  {
    display: "Villages",
    name: "villages",
    permissions: {
      create: "villages.create",
      read: "villages.read",
      update: "villages.update",
      delete: "villages.delete",
    },
  },
  {
    display: "Manifestations",
    name: "promises",
    permissions: {
      create: "promises.create",
      read: "promises.read",
      update: "promises.update",
      delete: "promises.delete",
    },
  },
  {
    display: "Members",
    name: "members",
    permissions: {
      create: "members.create",
      read: "members.read",
      update: "members.update",
      delete: "members.delete",
    },
  },

  {
    display: "Banners",
    name: "banners",
    permissions: {
      create: "banners.create",
      read: "banners.read",
      update: "banners.update",
      delete: "banners.delete",
    },
  },
  {
    display: "Mp'omurro",
    name: "mpomurro",
    permissions: {
      create: "mpomurro.create",
      read: "mpomurro.read",
      update: "mpomurro.update",
      delete: "mpomurro.delete",
    },
  },
  {
    display: "Settings",
    name: "settings",
    permissions: {
      create: "settings.create",
      read: "settings.read",
      update: "settings.update",
      delete: "settings.delete",
    },
  },
  {
    display: "N'osigaki",
    name: "nosigaki",
    permissions: {
      create: "nosigaki.create",
      read: "nosigaki.read",
      update: "nosigaki.update",
      delete: "nosigaki.delete",
    },
  },
  {
    display: "Blogs",
    name: "blogs",
    permissions: {
      create: "blogs.create",
      read: "blogs.read",
      update: "blogs.update",
      delete: "blogs.delete",
    },
  },
];

// Helper function to get all permission strings
export function getAllPermissions(): string[] {
  return permissions.flatMap((module) => Object.values(module.permissions));
}

// Helper function to check if a permission exists
export function isValidPermission(permission: string): boolean {
  return getAllPermissions().includes(permission);
}

// Helper to get module permissions by name
export function getModulePermissions(
  moduleName: string
): Permission | undefined {
  const module = permissions.find((m) => m.name === moduleName);
  return module?.permissions;
}

// Type for the permissions object
export type PermissionsType = {
  [K in (typeof permissions)[number]["name"]]: Permission;
};
