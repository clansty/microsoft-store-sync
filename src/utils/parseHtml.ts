import { load } from 'cheerio';
import { Package } from '../types/def';

export default (html: string) => {
  const $ = load(html);
  const links = $('tr>td>a');
  const packages: Package[] = [];
  for (const link of links) {
    const $link = $(link);
    packages.push({
      url: $link.attr('href'),
      name: $link.text(),
    });
  }
  return packages.filter(it => !it.name.endsWith('.BlockMap'));
}
