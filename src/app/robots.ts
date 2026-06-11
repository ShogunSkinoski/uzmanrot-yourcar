import type { MetadataRoute } from "next";
import { SITE } from "./_lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /customer/report carries a customer's plate + measurement data in the
        // URL — must never be indexed. /admin is private.
        disallow: ["/admin", "/customer/report"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
