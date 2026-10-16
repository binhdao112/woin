// Keep bookmarked preview paths, extra parameters and hashes while retiring the old world.
export function canonicalCampusURL(href){const url=new URL(href);url.searchParams.set('world','campus');return url.href;}
