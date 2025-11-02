import SessionExpiredView from "./view";

type SessionExpiredPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function sanitizeNext(nextParam: string | undefined) {
  if (!nextParam || typeof nextParam !== "string") {
    return "/";
  }
  if (!nextParam.startsWith("/")) {
    return "/";
  }
  return nextParam;
}

export default function SessionExpiredPage({
  searchParams,
}: SessionExpiredPageProps) {
  const rawNext =
    typeof searchParams?.next === "string" ? searchParams?.next : undefined;
  const next = sanitizeNext(rawNext);

  return <SessionExpiredView next={next} />;
}
