import { Site, useGetAllSitesQuery } from '../graphql';

let sitesById = null as Record<string, Site> | null;

// Although we invoke this as a React use hook, it's actually just used to load the data on startup, after which we cache it globally, and can grab it directly from getSite()
export function useSiteData() {
  const allSitesQuery = useGetAllSitesQuery();
  const allSites = allSitesQuery.data?.allSites;

  if (sitesById == null && allSites) {
    sitesById = {};
    for (const site of allSites) {
      sitesById[site.id] = site;
    }
  }

  //return sitesById;
  return allSitesQuery;
}

export function getSite(siteId: string) {
  const site = sitesById?.[siteId];
  if (!site) {
    return {
      id: siteId,
      //fullName: `SITE_${siteId}_IS_MISSING_FROM_SITE_DATA`,
      fullName: siteId,
      collectionTime: 'UNKNOWN',
      geoLocation: 'UNKNOWN',
    } as Site;
  }
  return site;
}
