import React from "react";
import { navigate, Route, routeHref } from "../../lib/routes";

export function InternalLink({ to, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: Route }) {
  return <a {...props} href={routeHref(to)} onClick={(event) => {
    props.onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || props.target === "_blank") return;
    event.preventDefault();
    navigate(to);
  }}>{children}</a>;
}
