const DEFAULT_PROJECTS = [
  { name: "Inbox", color: "#4285F4", isDefault: true },
  { name: "Personal", color: "#0F9D58" },
  { name: "Work", color: "#DB4437" }
];

const ERROR_MESSAGES = {
  PROJECT_NAME_REQUIRED: "Project name is required",
  PROJECT_NAME_EXISTS: "A project with this name already exists",
  PROJECT_NOT_FOUND: "Project not found",
  CANNOT_DELETE_DEFAULT: "Cannot delete default projects",
  USER_NOT_AUTHENTICATED: "User not authenticated",
};

module.exports = {
  DEFAULT_PROJECTS,
  ERROR_MESSAGES,
};
