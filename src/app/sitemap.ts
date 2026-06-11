import type { MetadataRoute } from "next";
import { SITE } from "./_lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE.url}/customer`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
