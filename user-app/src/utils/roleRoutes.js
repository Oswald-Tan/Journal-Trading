export const roleRoutes = {
  user: "/dashboard",
};

export const getDashboardPathByRole = (role) => roleRoutes[role] || "/";
