export function getOrigin(req?: Request) {
  let proto = req?.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  let host =
    req?.headers.get("x-forwarded-host") ||
    req?.headers.get("host") ||
    process.env.NEXT_PUBLIC_APP_HOST ||
    (process.env.NODE_ENV === "production" ? "dev--hyperprod.netlify.app" : "localhost:3000");

  if (process.env.NODE_ENV === "production" && /localhost/i.test(host)) {
    host = process.env.NEXT_PUBLIC_APP_HOST || "dev--hyperprod.netlify.app";
    proto = "https";
  }
  return `${proto}://${host}`;
}