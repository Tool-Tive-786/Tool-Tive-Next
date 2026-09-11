"use client";

import dynamic from "next/dynamic";

const RobotsTxtTool = dynamic(
  () => import("./RobotsTxtTool").then((mod) => mod.default),
  { ssr: false }
);

export default function RobotsTxtToolNoSSR() {
  return <RobotsTxtTool />;
}
