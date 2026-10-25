import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/auth")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  head: () => ({ meta: [{ title: "Account Access — VW Markets" }, { name: "description", content: "Access your VW Markets account." }, { property: "og:title", content: "Account Access — VW Markets" }, { property: "og:description", content: "Access your VW Markets account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
});