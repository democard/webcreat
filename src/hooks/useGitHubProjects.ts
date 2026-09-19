import { useEffect, useState } from "react";
import { projectsData } from "../data/projects";
import { Project } from "../types/blog";
import { CACHE_TTL, fetchProjects, ProjectSource, readProjectsCache, writeProjectsCache } from "../lib/github";

export const useGitHubProjects = (username = "democard") => {
  const [revision, setRevision] = useState(0);
  // Keep the first browser render identical to the static HTML, then apply device-local cache in the effect.
  const [state, setState] = useState<{ projects: Project[]; loading: boolean; source: ProjectSource }>(() => ({
    projects: username === "democard" ? projectsData : [], loading: true, source: "fallback",
  }));

  useEffect(() => {
    const cached = readProjectsCache(username);
    const fresh = revision === 0 && cached && Date.now() - cached.timestamp < CACHE_TTL;
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
  }, [username, revision]);

  return { ...state, refresh: () => setRevision((value) => value + 1) };
};
