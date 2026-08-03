import data from "./showcase.json";

export type ShowcaseProject = (typeof data.projects)[number];
export type ShowcaseNews = (typeof data.news)[number];
export type ShowcaseOpportunity = (typeof data.opportunities)[number];
export type ShowcaseForumPost = (typeof data.forum)[number];

export const showcaseProjects = data.projects;
export const showcaseNews = data.news;
export const showcaseOpportunities = data.opportunities;
export const showcaseForum = data.forum;

export function getShowcaseProject(id: string) {
  return showcaseProjects.find((item) => item.id === id);
}

export function getShowcaseNews(id: string) {
  return showcaseNews.find((item) => item.id === id);
}

export function getShowcaseOpportunity(id: string) {
  return showcaseOpportunities.find((item) => item.id === id);
}

export function getShowcaseForumPost(id: string) {
  return showcaseForum.find((item) => item.id === id);
}
