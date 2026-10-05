import type { IdeaPerson } from "./idea-search";

export type IdeaDiscussion = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  idea_topic: string;
  resource_url: string | null;
};
export type IdeaState = {
  userId: string | null;
  selected: string[];
  connections: string[];
  people: IdeaPerson[];
  counts: Record<string, number>;
  discussions: IdeaDiscussion[];
  error: string | null;
};
