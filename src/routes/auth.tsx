import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/auth")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  head: () => ({ meta: [{ title: "Account Access — ETO Markets" }, { name: "description", content: "Access your ETO Markets account." }, { property: "og:title", content: "Account Access — ETO Markets" }, { property: "og:description", content: "Access your ETO Markets account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
});