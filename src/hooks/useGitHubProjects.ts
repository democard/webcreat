import { useEffect, useRef, useState } from "react";
import { projectsData } from "../data/projects";
import { Project } from "../types/blog";
import { CACHE_TTL, fetchProjects, ProjectSource, readProjectsCache, writeProjectsCache } from "../lib/github";

export const useGitHubProjects = (username = "democard", { enabled = true }: { enabled?: boolean } = {}) => {
  const [revision, setRevision] = useState(0);
  const handledRevision = useRef(0);
  // Keep the first browser render identical to the static HTML, then apply device-local cache in the effect.
  const [state, setState] = useState<{ projects: Project[]; loading: boolean; source: ProjectSource }>(() => ({
    projects: username === "democard" ? projectsData : [], loading: enabled, source: "fallback",
  }));

  useEffect(() => {
    if (!enabled) {
      setState((previous) => previous.loading ? { ...previous, loading: false } : previous);
      return;
    }
    const cached = readProjectsCache(username);
    const forceRefresh = revision !== handledRevision.current;
    handledRevision.current = revision;
    const fresh = !forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL;
    setState({ projects: cached?.data ?? (username === "democard" ? projectsData : []),
      loading: !fresh, source: cached ? "cache" : "fallback" });
    if (fresh) return;

    const controller = new AbortController();
    const update = (projects: Project[]) => {
      if (!controller.signal.aborted) setState({ projects: [...projects], loading: false, source: "live" });
    };
    fetchProjects(username, controller.signal, update).then((projects) => {
      if (controller.signal.aborted) return;
      update(projects);
      writeProjectsCache(username, projects);
    }).catch(() => {
      if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false }));
    });
    return () => controller.abort();
  }, [username, revision, enabled]);

  return { ...state, refresh: () => setRevision((value) => value + 1) };
};
