import YAML from 'yaml';
import fsP from 'fs/promises';
import { Config, Package } from './types/def';
import parseHtml from './utils/parseHtml';
import { WebSocket as Aria2 } from 'libaria2-ts';
import * as path from 'path';
import sleep from 'sleep-promise';

(async () => {
  const config = YAML.parse(await fsP.readFile(process.env.CONFIG || 'config.yaml', 'utf-8')) as Config;
  if (!config.downloaddir)
    config.downloaddir = config.basedir;

  while (true) {
    const aria2 = new Aria2.Client(config.aria2); // 防止 aria2 重启之后断掉
    for (const pkg of config.packages) {
      let type: string, url: string;
      if ('id' in pkg) {
        type = 'ProductId';
        url = pkg.id;
      }
      else if ('url' in pkg) {
        type = 'url';
        url = pkg.url;
      }
      else continue;
      const lang = pkg.lang || 'en-US';
      const ring = pkg.ring || 'RP';
      console.log('获取包信息', url);
      let packages: Package[];
      try {
        const req = await fetch('https://store.rg-adguard.net/api/GetFiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            type, url, ring, lang,
          }),
        });
        const html = await req.text();
        packages = parseHtml(html);
      }
      catch (e) {
        console.log('获取失败', e);
        continue;
      }
      console.log('获取到', packages.length, '个包');
      const pkgDir = path.join(config.basedir, pkg.dir);
      await fsP.mkdir(pkgDir, { recursive: true });
      const files = await fsP.readdir(pkgDir);
      for (const file of files) {
        if (!packages.some(it => it.name === file)) {
          console.log('删除文件', file);
          await fsP.rm(path.join(pkgDir, file));
        }
      }
      const packagesToDownload = packages.filter(it => !files.includes(it.name));
      console.log('需要下载', packagesToDownload.length, '个文件');
      for (const pkgInfo of packagesToDownload) {
        try {
          await aria2.addUri(pkgInfo.url, {
            dir: path.join(config.downloaddir, pkg.dir),
            out: pkgInfo.name,
          });
        }
        catch (e) {
          console.log('推送下载任务失败', e);
        }
      }
    }
    await sleep(1000 * 60 * 60 * 24);
  }
})();
