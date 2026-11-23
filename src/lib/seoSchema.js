const BASE_URL = 'https://mallouliauto.com';

/**
 * Builds a schema.org BreadcrumbList JSON-LD block.
 * `items` is an ordered list of { name, path } from the site root down to
 * the current page (path relative, e.g. '/solutions').
 */
export function buildBreadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}
