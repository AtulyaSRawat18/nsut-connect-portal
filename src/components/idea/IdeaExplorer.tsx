"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Atom,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  Compass,
  Cpu,
  FlaskConical,
  HeartPulse,
  Leaf,
  Lightbulb,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Telescope,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  IDEA_CATEGORIES,
  IDEA_TOPICS,
  searchPeople,
  searchTopics,
  type IdeaTopic,
} from "@/lib/idea-search";
import type { IdeaState } from "@/lib/idea-types";
import { getDepartmentCompactLabel } from "@/lib/departments";
import ForumReportButton from "@/app/forum/ForumReportButton";

const categoryIcons = [
  Cpu,
  TrendingUp,
  Atom,
  Telescope,
  HeartPulse,
  FlaskConical,
  Compass,
  Leaf,
];
const emptyState: IdeaState = {
  userId: null,
  selected: [],
  connections: [],
  people: [],
  counts: {},
  discussions: [],
  error: null,
};
const tabs = ["Spaces", "People", "Resources", "Discussions"] as const;
type Tab = (typeof tabs)[number];

function TopicIcon({ topic }: { topic: IdeaTopic }) {
  const index = IDEA_CATEGORIES.indexOf(topic.category);
  const Icon = categoryIcons[index] || Lightbulb;
  return (
    <span className={`idea-topic-icon idea-color-${index % 4}`}>
      <Icon size={23} strokeWidth={1.7} />
    </span>
  );
}

export default function IdeaExplorer({
  topicId,
  initialScope = "explore",
}: {
  topicId?: string;
  initialScope?: "explore" | "mine" | "connections";
}) {
  const router = useRouter();
  const topic = IDEA_TOPICS.find((item) => item.id === topicId);
  const [state, setState] = useState<IdeaState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All fields");
  const [tab, setTab] = useState<Tab>(
    topic || initialScope === "connections" ? "People" : "Spaces",
  );
  const [scope, setScope] = useState<"explore" | "mine" | "connections">(
    initialScope,
  );
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [draftTopic, setDraftTopic] = useState(topicId || IDEA_TOPICS[0].id);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftResource, setDraftResource] = useState("");
  const [draftError, setDraftError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const response = await fetch("/api/idea", { cache: "no-store" });
      const result = await response.json();
      if (version !== requestVersion.current) return;
      if (!response.ok)
        throw new Error(result.error || "Community data is unavailable.");
      setState(result);
    } catch (error) {
      if (version === requestVersion.current)
        setState((previous) => ({
          ...previous,
          error:
            error instanceof Error
              ? error.message
              : "Community data is unavailable.",
        }));
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  function changeTab(next: Tab) {
    setTab(next);
    setPage(1);
  }
  function changeScope(next: typeof scope) {
    if (topicId) {
      router.push(`/idea?view=${next}`);
      return;
    }
    setScope(next);
    setQuery("");
    setCategory("All fields");
    changeTab(next === "connections" ? "People" : "Spaces");
  }

  async function mutate(payload: Record<string, unknown>, key: string) {
    if (pending) return false;
    if (!state.userId) {
      setMessage("Sign in to join spaces and connect with the community.");
      return false;
    }
    setPending(key);
    setMessage("");
    try {
      const response = await fetch("/api/idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Your change could not be saved.");
      await load();
      setPage(1);
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Your change could not be saved.",
      );
      return false;
    } finally {
      setPending("");
    }
  }

  async function join(id: string) {
    const selected = !state.selected.includes(id);
    if (await mutate({ action: "interest", topicId: id, selected }, id))
      setMessage(
        selected
          ? "Space joined. You are now discoverable to other members here."
          : "Space removed from your interests.",
      );
  }

  const filteredTopics = useMemo(() => {
    const found = searchTopics(query).filter(
      (item) =>
        (!topic || item.id === topic.id) &&
        (category === "All fields" || item.category === category) &&
        (scope !== "mine" || state.selected.includes(item.id)),
    );
    if (query.trim()) return found;
    return [...found].sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title)
        : (state.counts[b.id] || 0) - (state.counts[a.id] || 0),
    );
  }, [query, topic, category, scope, state.selected, state.counts, sort]);
  const matchingTopicIds = new Set(filteredTopics.map((item) => item.id));
  const people = searchPeople(state.people, query, topicId).filter(
    (person) =>
      (category === "All fields" ||
        person.topics.some((id) =>
          IDEA_TOPICS.some(
            (item) => item.id === id && item.category === category,
          ),
        )) &&
      (scope !== "connections" || state.connections.includes(person.id)) &&
      (scope !== "mine" ||
        person.topics.some((id) => state.selected.includes(id))),
  );
  const resources = filteredTopics.flatMap((item) =>
    item.resources.map((resource) => ({ ...resource, topic: item })),
  );
  const discussions = state.discussions.filter(
    (post) =>
      (!topicId || post.idea_topic === topicId) &&
      (category === "All fields" ||
        IDEA_TOPICS.find((item) => item.id === post.idea_topic)?.category ===
          category) &&
      (scope !== "mine" || state.selected.includes(post.idea_topic)) &&
      (!query ||
        matchingTopicIds.has(post.idea_topic) ||
        `${post.title} ${post.content}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const sharedResources = discussions
    .filter((post) => post.resource_url)
    .map((post) => ({
      title: post.title,
      url: post.resource_url!,
      kind: "Community resource",
      topic: IDEA_TOPICS.find((item) => item.id === post.idea_topic)!,
    }))
    .filter((item) => item.topic);
  const allResources = [...sharedResources, ...resources];
  const popular = [...IDEA_TOPICS]
    .filter((item) => (state.counts[item.id] || 0) > 0)
    .sort((a, b) => (state.counts[b.id] || 0) - (state.counts[a.id] || 0))
    .slice(0, 4);
  const resultCount =
    tab === "Spaces"
      ? filteredTopics.length
      : tab === "People"
        ? people.length
        : tab === "Resources"
          ? allResources.length
          : discussions.length;
  const hasJoined = Boolean(topic && state.selected.includes(topic.id));
  const start = (page - 1) * 12;

  function openDiscussion() {
    if (!state.userId) {
      setMessage("Sign in to start a discussion.");
      return;
    }
    if (!state.selected.length) {
      setMessage("Join an interest space before starting a discussion.");
      return;
    }
    setDraftTopic(
      topicId && state.selected.includes(topicId) ? topicId : state.selected[0],
    );
    setDraftError("");
    dialog.current?.showModal();
  }

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    setDraftError("");
    const ok = await mutate(
      {
        action: "discussion",
        topicId: draftTopic,
        title: draftTitle,
        content: draftContent,
        resourceUrl: draftResource,
      },
      "discussion",
    );
    if (ok) {
      dialog.current?.close();
      setDraftTitle("");
      setDraftContent("");
      setDraftResource("");
      changeTab("Discussions");
      setMessage("Your discussion has been published.");
    } else
      setDraftError(
        "Could not publish. Check your connection, membership, and fields, then try again.",
      );
  }

  return (
    <div className="idea-page">
      <div className="idea-topline">
        <span>
          <Lightbulb size={16} /> The interdisciplinary commons
        </span>
        <span>NSUT / Across every branch</span>
      </div>
      <div className="idea-layout">
        <aside className="idea-sidebar">
          <Link href="/idea" className="idea-wordmark">
            ID<span>ea</span>
            <span className="idea-wordmark-dot">.</span>
          </Link>
          <p className="idea-wordmark-caption">Idea Discussion</p>
          <nav aria-label="IDea views" className="idea-side-nav">
            <button
              aria-pressed={scope === "explore"}
              onClick={() => changeScope("explore")}
            >
              <Compass size={18} /> Explore spaces
            </button>
            <button
              aria-pressed={scope === "mine"}
              onClick={() => changeScope("mine")}
            >
              <Bookmark size={18} /> My interests{" "}
              <span>{state.selected.length}</span>
            </button>
            <button
              aria-pressed={scope === "connections"}
              onClick={() => changeScope("connections")}
            >
              <Users size={18} /> My connections{" "}
              <span>{state.connections.length}</span>
            </button>
          </nav>
          <div className="idea-sidebar-section">
            <h2>Your spaces</h2>
            {state.selected.length ? (
              state.selected.map((id) => (
                <Link key={id} href={`/idea/${id}`} className="idea-side-topic">
                  <span className="idea-small-dot" />
                  {IDEA_TOPICS.find((item) => item.id === id)?.title}
                  <ChevronRight size={14} />
                </Link>
              ))
            ) : (
              <p>
                {loading
                  ? "Loading your spaces..."
                  : state.userId
                    ? "No spaces joined yet."
                    : "Sign in to keep your interests together."}
              </p>
            )}
          </div>
          <div className="idea-sidebar-section">
            <h2>{popular.length ? "Popular spaces" : "Discover a field"}</h2>
            {(popular.length
              ? popular
              : IDEA_TOPICS.filter((item) =>
                  ["quantum-computing", "fsoc", "bioinformatics"].includes(
                    item.id,
                  ),
                )
            ).map((item) => (
              <Link
                key={item.id}
                href={`/idea/${item.id}`}
                className="idea-side-topic"
              >
                {item.title}
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
          <div className="idea-campus-note">
            <Image
              src="/campus-fountain.jpg"
              width={440}
              height={190}
              alt="NSUT campus entrance"
            />
            <strong>
              Different branches.
              <br />
              Shared curiosity.
            </strong>
            <span>One campus. More possibilities.</span>
          </div>
        </aside>

        <section className="idea-main">
          {topic && (
            <Link className="idea-back" href="/idea">
              <ArrowLeft size={15} /> All spaces
            </Link>
          )}
          <header className="idea-heading">
            <div>
              <p className="idea-eyebrow">
                {topic ? topic.category : "Make room for your next idea"}
              </p>
              <h1>
                {topic
                  ? topic.title
                  : scope === "mine"
                    ? "Your interests"
                    : scope === "connections"
                      ? "Your connections"
                      : "Find your kind of curious."}
              </h1>
              <p>
                {topic
                  ? topic.description
                  : "Meet across disciplines. Ask better questions. Build together."}
              </p>
            </div>
            <div className="idea-heading-actions">
              {topic && (
                <button
                  disabled={Boolean(pending) || loading || Boolean(state.error)}
                  className={
                    hasJoined ? "idea-button-secondary" : "idea-button"
                  }
                  onClick={() => join(topic.id)}
                >
                  {hasJoined ? <Check size={16} /> : <Plus size={16} />}
                  {hasJoined ? "Joined" : "Join space"}
                </button>
              )}
              <button
                className={topic ? "idea-button-secondary" : "idea-button"}
                onClick={openDiscussion}
              >
                <Plus size={17} /> Start a discussion
              </button>
            </div>
          </header>
          {topic && (
            <div className="idea-niches">
              {topic.niches.map((niche) => (
                <span key={niche}>{niche}</span>
              ))}
            </div>
          )}
          {topic && (
            <p className="idea-privacy-note">
              Joining makes your name and interest visible to signed-in
              community members.
            </p>
          )}

          <div className="idea-search-row">
            <label className="idea-search">
              <Search size={20} />
              <input
                aria-label="Search interests and people"
                maxLength={160}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder={
                  topic
                    ? "Search people, resources, discussions..."
                    : "What are you curious about? Try quantum computing, FSOC..."
                }
              />
              {query && (
                <button
                  aria-label="Clear search"
                  title="Clear search"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                >
                  <X size={17} />
                </button>
              )}
            </label>
            <select
              aria-label="Filter by field"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              <option>All fields</option>
              {IDEA_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="idea-tabs" role="tablist" aria-label="Explore IDea">
            {tabs.map((item, index) => (
              <button
                key={item}
                role="tab"
                id={`idea-tab-${item}`}
                aria-controls="idea-results"
                aria-selected={tab === item}
                tabIndex={tab === item ? 0 : -1}
                onKeyDown={(event) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  ) {
                    event.preventDefault();
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? tabs.length - 1
                          : (index +
                              (event.key === "ArrowRight" ? 1 : -1) +
                              tabs.length) %
                            tabs.length;
                    changeTab(tabs[next]);
                    document.getElementById(`idea-tab-${tabs[next]}`)?.focus();
                  }
                }}
                onClick={() => changeTab(item)}
              >
                {item === "Spaces" ? (
                  <Compass size={16} />
                ) : item === "People" ? (
                  <Users size={16} />
                ) : item === "Resources" ? (
                  <BookOpen size={16} />
                ) : (
                  <MessageSquare size={16} />
                )}
                {item}
                {query && item === "People" && state.userId && <span>{people.length}</span>}
              </button>
            ))}
          </div>
          {state.error && (
            <div className="idea-alert" role="alert">
              <CircleAlert size={18} />
              <span>{state.error}</span>
              <button onClick={load} disabled={loading}>
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          )}
          {message && (
            <div className="idea-message" role="status">
              <span>
                {message}
                {!state.userId && (
                  <>
                    {" "}
                    <Link
                      href={`/login?next=${encodeURIComponent(topicId ? `/idea/${topicId}` : "/idea")}`}
                    >
                      Sign in <ArrowRight size={14} />
                    </Link>
                  </>
                )}
              </span>
              <button
                title="Dismiss message"
                aria-label="Dismiss message"
                onClick={() => setMessage("")}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div
            id="idea-results"
            role="tabpanel"
            aria-labelledby={`idea-tab-${tab}`}
            tabIndex={0}
          >
            <div className="idea-results-heading">
              <h2>
                {tab === "Spaces"
                  ? query
                    ? "Matching spaces"
                    : scope === "mine"
                      ? "Your selected spaces"
                      : "Explore interest spaces"
                  : tab === "People"
                    ? scope === "connections"
                      ? "Saved connections"
                      : "People with shared interests"
                    : tab === "Resources"
                      ? "The resource shelf"
                      : "Recent conversations"}{" "}
                <span>{resultCount}</span>
              </h2>
              {tab === "Spaces" && !query && (
                <select
                  aria-label="Sort spaces"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="popular">Most joined</option>
                  <option value="name">A to Z</option>
                </select>
              )}
            </div>
            {loading && tab !== "Spaces" && tab !== "Resources" ? (
              <div className="idea-empty" role="status">
                <Loader2 className="animate-spin" />
                <h3>Loading the community...</h3>
              </div>
            ) : tab === "People" && !state.userId ? (
              <div className="idea-empty">
                <Users size={30} />
                <h3>Your next collaborator could be here.</h3>
                <p>Sign in to meet members from across NSUT.</p>
                <Link
                  className="idea-button"
                  href={`/login?next=${encodeURIComponent(topicId ? `/idea/${topicId}` : "/idea")}`}
                >
                  Sign in <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <>
                {tab === "Spaces" && (
                  <div className="idea-topic-grid">
                    {filteredTopics.slice(start, start + 12).map((item) => {
                      const selected = state.selected.includes(item.id);
                      return (
                        <article key={item.id} className="idea-topic-card">
                          <div className="idea-card-top">
                            <TopicIcon topic={item} />
                            <button
                              className={
                                selected ? "idea-join joined" : "idea-join"
                              }
                              disabled={
                                Boolean(pending) ||
                                loading ||
                                Boolean(state.error)
                              }
                              aria-label={`${selected ? "Leave" : "Join"} ${item.title}`}
                              title={
                                selected
                                  ? "Leave this space"
                                  : "Join this space and become discoverable to members"
                              }
                              onClick={() => join(item.id)}
                            >
                              {pending === item.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : selected ? (
                                <Check size={15} />
                              ) : (
                                <Plus size={15} />
                              )}
                              {selected ? "Joined" : "Join"}
                            </button>
                          </div>
                          <p className="idea-card-category">{item.category}</p>
                          <h3>
                            <Link href={`/idea/${item.id}`}>{item.title}</Link>
                          </h3>
                          <p className="idea-card-description">
                            {item.description}
                          </p>
                          <div className="idea-card-niches">
                            {item.niches.slice(0, 3).map((niche) => (
                              <span key={niche}>{niche}</span>
                            ))}
                            <span>+{item.niches.length - 3}</span>
                          </div>
                          <footer>
                            <span>
                              <Users size={14} />{" "}
                              {loading || state.error
                                ? "Members unavailable"
                                : `${state.counts[item.id] || 0} members`}
                            </span>
                            <Link
                              href={`/idea/${item.id}`}
                              aria-label={`Explore ${item.title}`}
                            >
                              Explore <ArrowUpRight size={16} />
                            </Link>
                          </footer>
                        </article>
                      );
                    })}
                  </div>
                )}
                {tab === "People" && (
                  <div className="idea-people-grid">
                    {people.slice(start, start + 12).map((person) => (
                      <article key={person.id} className="idea-person">
                        <div className="idea-person-header">
                          <span className="idea-avatar">
                            {person.name
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")}
                          </span>
                          <div>
                            <h3>
                              <Link href={`/profile/${person.id}`}>
                                {person.name}
                              </Link>
                            </h3>
                            <span>
                              {person.role} /{" "}
                              {getDepartmentCompactLabel(person.department)}
                              {person.is_demo && " / Demo"}
                            </span>
                          </div>
                        </div>
                        <p>
                          {person.bio ||
                            "Open to interdisciplinary ideas and conversations."}
                        </p>
                        <div className="idea-person-interests">
                          {person.topics.slice(0, 3).map((id) => (
                            <Link key={id} href={`/idea/${id}`}>
                              {
                                IDEA_TOPICS.find((item) => item.id === id)
                                  ?.title
                              }
                            </Link>
                          ))}
                        </div>
                        <footer>
                          <Link href={`/profile/${person.id}`}>
                            View profile <ArrowUpRight size={14} />
                          </Link>
                          {person.id !== state.userId && (
                            <button
                              disabled={
                                Boolean(pending) || Boolean(state.error)
                              }
                              className="idea-join"
                              onClick={() =>
                                mutate(
                                  {
                                    action: "connection",
                                    targetId: person.id,
                                    selected: !state.connections.includes(
                                      person.id,
                                    ),
                                  },
                                  person.id,
                                )
                              }
                            >
                              {state.connections.includes(person.id) ? (
                                <>
                                  <Check size={15} /> Connected
                                </>
                              ) : (
                                <>
                                  <Plus size={15} /> Connect
                                </>
                              )}
                            </button>
                          )}
                        </footer>
                      </article>
                    ))}
                  </div>
                )}
                {tab === "Resources" && (
                  <div className="idea-resource-list">
                    {allResources
                      .slice(start, start + 12)
                      .map((resource, index) => (
                        <article
                          key={`${resource.topic.id}-${resource.url}-${index}`}
                        >
                          <span className="idea-resource-icon">
                            <BookOpen size={21} />
                          </span>
                          <div>
                            <p>
                              {resource.kind} <span>/</span>{" "}
                              {resource.topic.title}
                            </p>
                            <h3>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {resource.title} <ArrowUpRight size={16} />
                              </a>
                            </h3>
                            <small>{new URL(resource.url).hostname}</small>
                          </div>
                          <Link
                            href={`/idea/${resource.topic.id}`}
                            aria-label={`Open ${resource.topic.title}`}
                            title="Open interest space"
                          >
                            <ChevronRight size={18} />
                          </Link>
                        </article>
                      ))}
                  </div>
                )}
                {tab === "Discussions" && (
                  <div className="idea-discussions">
                    {discussions.slice(start, start + 12).map((post) => (
                      <article key={post.id}>
                        <Link
                          className="idea-discussion-topic"
                          href={`/idea/${post.idea_topic}`}
                        >
                          {
                            IDEA_TOPICS.find(
                              (item) => item.id === post.idea_topic,
                            )?.title
                          }
                        </Link>
                        <h3>
                          <Link href={`/forum/${post.id}`}>{post.title}</Link>
                        </h3>
                        <p>{post.content}</p>
                        {post.resource_url && (
                          <a
                            href={post.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="idea-resource-link"
                          >
                            <BookOpen size={15} /> Shared resource{" "}
                            <ArrowUpRight size={15} />
                          </a>
                        )}
                        <footer>
                          <span>
                            {new Date(post.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <Link href={`/forum/${post.id}`}>
                            <MessageSquare size={15} /> Join conversation
                          </Link>
                          <ForumReportButton
                            entityType="forum_post"
                            entityId={post.id}
                          />
                        </footer>
                      </article>
                    ))}
                  </div>
                )}
                {!resultCount && (
                  <div className="idea-empty">
                    <Search size={28} />
                    <h3>
                      {query
                        ? "No matches yet."
                        : tab === "Discussions"
                          ? "A good question is a good beginning."
                          : scope === "connections"
                            ? "Your connections will appear here."
                            : scope === "mine"
                              ? "Follow your curiosity."
                              : "Be the first to join this space."}
                    </h3>
                    <p>
                      {query
                        ? "Try another interest, a broader field, or a member's name."
                        : tab === "Discussions"
                          ? "Start the first conversation in this space."
                          : "Explore a space to meet people with shared interests."}
                    </p>
                    {query && (
                      <button
                        className="idea-button-secondary"
                        onClick={() => {
                          setQuery("");
                          setCategory("All fields");
                        }}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
                {resultCount > 12 && (
                  <div className="idea-pagination">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      aria-label="Previous results"
                      title="Previous results"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <span>
                      Page {page} of {Math.ceil(resultCount / 12)}
                    </span>
                    <button
                      disabled={page * 12 >= resultCount}
                      onClick={() => setPage(page + 1)}
                      aria-label="Next results"
                      title="Next results"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
      <dialog
        ref={dialog}
        className="idea-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="idea-dialog-title">
          <h2>Start a discussion</h2>
          <button
            aria-label="Close discussion form"
            title="Close discussion form"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={publish}>
          <label>
            Interest space
            <select
              value={draftTopic}
              onChange={(event) => setDraftTopic(event.target.value)}
            >
              {state.selected.map((id) => (
                <option key={id} value={id}>
                  {IDEA_TOPICS.find((item) => item.id === id)?.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input
              required
              minLength={8}
              maxLength={180}
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="A question, an idea, a possible collaboration..."
            />
          </label>
          <label>
            Your idea
            <textarea
              required
              minLength={30}
              maxLength={5000}
              rows={5}
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              placeholder="What are you exploring, and who would you like to work with?"
            />
          </label>
          <label>
            Resource link <span>(optional)</span>
            <input
              type="url"
              maxLength={700}
              pattern="https://.*"
              value={draftResource}
              onChange={(event) => setDraftResource(event.target.value)}
              placeholder="https://"
            />
          </label>
          <p>
            Published with your name. Community discussions are public and
            moderated.
          </p>
          {draftError && (
            <p role="alert" className="text-primary">
              {draftError}
            </p>
          )}
          <button className="idea-button" disabled={Boolean(pending)}>
            {pending === "discussion" ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <MessageSquare size={17} />
            )}{" "}
            Publish discussion
          </button>
        </form>
      </dialog>
    </div>
  );
}
