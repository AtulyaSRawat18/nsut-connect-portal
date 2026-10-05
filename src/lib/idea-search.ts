import Fuse from "fuse.js";
import catalogue from "../content/idea-topics.json";

export const IDEA_TOPICS = catalogue;
export type IdeaTopic = (typeof IDEA_TOPICS)[number];
export type IdeaPerson = {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  topics: string[];
  is_demo?: boolean;
};
export const IDEA_CATEGORIES = [
  ...new Set(IDEA_TOPICS.map((topic) => topic.category)),
];
const topicSearch = new Fuse(IDEA_TOPICS, {
  threshold: 0.32,
  ignoreLocation: true,
  keys: [
    { name: "title", weight: 3 },
    { name: "aliases", weight: 3 },
    { name: "niches", weight: 2 },
    "category",
  ],
});

export function searchTopics(query: string) {
  return query.trim()
    ? topicSearch
        .search(query.trim().slice(0, 160))
        .map((result) => result.item)
    : IDEA_TOPICS;
}

export function searchPeople(
  people: IdeaPerson[],
  query: string,
  topicId?: string,
) {
  const candidates = topicId
    ? people.filter((person) => person.topics.includes(topicId))
    : people;
  if (!query.trim()) return candidates;
  const topicIds = new Set(searchTopics(query).map((topic) => topic.id));
  const byInterest = candidates.filter((person) =>
    person.topics.some((id) => topicIds.has(id)),
  );
  const direct = new Fuse(candidates, {
    threshold: 0.3,
    ignoreLocation: true,
    keys: ["name", "department", "bio"],
  })
    .search(query.trim().slice(0, 160))
    .map((result) => result.item);
  return [
    ...new Map(
      [...byInterest, ...direct].map((person) => [person.id, person]),
    ).values(),
  ];
}
